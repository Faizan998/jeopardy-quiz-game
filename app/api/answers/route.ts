import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { questionId, selectedIdx } = await req.json();

    if (!questionId || selectedIdx === undefined) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return new NextResponse('Question not found', { status: 404 });
    }

    const isCorrect = selectedIdx === question.CorrectIdx;
    const pointsEarned = isCorrect ? question.amount : 0;

    // Create answer record
    await prisma.answer.create({
      data: {
        userId: session.user.id,
        questionId,
        selectedIdx: selectedIdx.toString(),
        isCorrect,
        pointsEarned,
      },
    });

    // Update user's total amount if correct
    if (isCorrect) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalAmount: {
            increment: pointsEarned,
          },
        },
      });
    }

    return NextResponse.json({
      isCorrect,
      pointsEarned,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 