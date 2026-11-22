import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        _count: {
          select: { modelProviders: true },
        },
        modelProviders: {
          include: {
            model: {
              select: {
                id: true,
                name: true,
                slug: true,
                lab: { select: { name: true, slug: true } },
              },
            },
          },
          orderBy: { inputPricePer1M: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: providers });
  } catch (error) {
    console.error('GET /api/providers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}