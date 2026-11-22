import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const rankingsQuerySchema = z.object({
  category: z.string().trim().optional(),
  benchmark: z.string().trim().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = rankingsQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { category, benchmark } = parsed.data;
    const where: Prisma.BenchmarkScoreWhereInput = {};

    if (category && category.toLowerCase() !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (benchmark) {
      where.benchmarkName = { equals: benchmark, mode: 'insensitive' };
    }

    const [scores, distinctBenchmarks] = await Promise.all([
      prisma.benchmarkScore.findMany({
        where,
        include: {
          model: {
            include: {
              lab: { select: { id: true, name: true, slug: true } },
              modelProviders: {
                orderBy: { inputPricePer1M: 'asc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { score: 'desc' },
      }),
      prisma.benchmarkScore.findMany({
        select: { benchmarkName: true, category: true },
        distinct: ['benchmarkName', 'category'],
      }),
    ]);

    return NextResponse.json({
      data: scores,
      filters: distinctBenchmarks,
    });
  } catch (error) {
    console.error('GET /api/rankings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}