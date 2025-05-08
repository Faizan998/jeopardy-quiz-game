import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


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