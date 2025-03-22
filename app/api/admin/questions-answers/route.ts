import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET() {
  try {
    const questionsWithAnswers = await prisma.question.findMany({
      include: {
        category: true,
        Answer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    
    return NextResponse.json(questionsWithAnswers);
  } catch (error) {
    console.error('Error fetching questions with answers:', error);
    return NextResponse.json({ error: 'Failed to fetch questions with answers' }, { status: 500 });
  }
} 