import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const labs = await prisma.lab.findMany({
      include: {
        _count: {
          select: { models: true },
        },
        models: {
          select: {
            id: true,
            name: true,
            slug: true,
            modelType: true,
            contextWindow: true,
          },
          orderBy: { releaseDate: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: labs });
  } catch (error) {
    console.error('GET /api/labs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}