import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';

const modelsQuerySchema = z.object({
  q: z.string().trim().optional(),
  lab: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  capability: z.string().trim().optional(),
  modality: z.string().trim().optional(),
  modelType: z.string().trim().optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'context_desc', 'newest'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = modelsQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { q, lab, provider, capability, modality, modelType, sort, page, limit } =
      parsed.data;

    const where: Prisma.ModelWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (lab) {
      where.lab = { slug: lab };
    }

    if (provider) {
      where.modelProviders = {
        some: { provider: { slug: provider } },
      };
    }

    if (capability) {
      where.capabilities = { has: capability };
    }

    if (modality) {
      where.modalities = { has: modality };
    }

    if (modelType) {
      where.modelType = { equals: modelType, mode: 'insensitive' };
    }

    const models = await prisma.model.findMany({
      where,
      include: {
        lab: {
          select: { id: true, name: true, slug: true },
        },
        modelProviders: {
          include: {
            provider: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { inputPricePer1M: 'asc' },
        },
        benchmarks: true,
      },
      orderBy:
        sort === 'context_desc'
          ? { contextWindow: 'desc' }
          : sort === 'newest'
          ? { releaseDate: 'desc' }
          : undefined,
    });

    // Enrich each model with its lowest provider pricing for display and price sorting
    const enriched = models.map((model) => {
      const cheapestOffering = model.modelProviders[0] ?? null;
      return {
        ...model,
        lowestInputPrice: cheapestOffering?.inputPricePer1M ?? null,
        lowestOutputPrice: cheapestOffering?.outputPricePer1M ?? null,
        providerCount: model.modelProviders.length,
      };
    });

    if (sort === 'price_asc') {
      enriched.sort(
        (a, b) => (a.lowestInputPrice ?? Infinity) - (b.lowestInputPrice ?? Infinity)
      );
    } else if (sort === 'price_desc') {
      enriched.sort(
        (a, b) => (b.lowestInputPrice ?? -1) - (a.lowestInputPrice ?? -1)
      );
    }

    const total = enriched.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = enriched.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('GET /api/models error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}