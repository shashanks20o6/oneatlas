import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const compareQuerySchema = z.object({
  slugs: z.string().min(1, 'At least one model slug is required'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = compareQuerySchema.safeParse({
      slugs: searchParams.get('slugs') ?? '',
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Provide comma-separated slugs, e.g. ?slugs=gpt-4o,claude-3-5-sonnet' },
        { status: 400 }
      );
    }

    const slugList = Array.from(
      new Set(
        parsed.data.slugs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    ).slice(0, 4);

    const models = await prisma.model.findMany({
      where: { slug: { in: slugList } },
      include: {
        lab: true,
        modelProviders: {
          include: { provider: true },
          orderBy: { inputPricePer1M: 'asc' },
        },
        benchmarks: true,
      },
    });

    // Preserve the order requested in the URL query string
    const orderedModels = slugList
      .map((slug) => models.find((m) => m.slug === slug))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    return NextResponse.json({ data: orderedModels });
  } catch (error) {
    console.error('GET /api/compare error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}