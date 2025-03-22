import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  // Properly destructure the params with await
  const params = await context.params;
  const { id } = params;
  
  try {
    const question = await prisma.question.findUnique({
      where: {
        id,
      },
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
    });
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question with answers:', error);
    return NextResponse.json({ error: 'Failed to fetch question with answers' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  // Properly destructure the params with await
  const params = await context.params;
  const { id } = params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: {
        id,
      },
      data: {
        value: body.value,
        options: body.options,
        amount: body.amount,
        CorrectIdx: body.correctIdx,
        categoryId: body.categoryId,
      },
      include: {
        category: true,
        Answer: true,
      },
    });
    
    // If there are answers to update
    if (body.answers && body.answers.length > 0) {
      // Process each answer update
      for (const answer of body.answers) {
        if (answer.id) {
          // Update existing answer
          await prisma.answer.update({
            where: {
              id: answer.id,
            },
            data: {
              selectedIdx: answer.selectedIdx,
              isCorrect: answer.isCorrect,
              pointsEarned: answer.pointsEarned,
            },
          });
        }
      }
    }
    
    // Get the updated question with all its answers
    const questionWithUpdatedAnswers = await prisma.question.findUnique({
      where: {
        id,
      },
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
    });
    
    return NextResponse.json(questionWithUpdatedAnswers);
  } catch (error) {
    console.error('Error updating question with answers:', error);
    return NextResponse.json({ error: 'Failed to update question with answers' }, { status: 500 });
  }
} 