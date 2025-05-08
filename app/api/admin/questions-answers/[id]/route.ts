import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const  id  = (await params).id;
  
  try {
    const question = await prisma.question.findUnique({
      where: {
        id
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
  { params }: { params: Promise<{ id: string }> }
) {
  const  id  = (await params).id;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Update the question with shuffled options
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
      // Process each answer update with new indices
      for (const answer of body.answers) {
        if (answer.id) {
          // Update existing answer with new selected index
          await prisma.answer.update({
            where: {
              id: answer.id,
            },
            data: {
              selectedIdx: answer.selectedIdx.toString(), // Ensure it's stored as string
              isCorrect: answer.selectedIdx === body.correctIdx, // Recalculate correctness based on new indices
              pointsEarned: answer.selectedIdx === body.correctIdx ? updatedQuestion.amount : 0, // Recalculate points
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