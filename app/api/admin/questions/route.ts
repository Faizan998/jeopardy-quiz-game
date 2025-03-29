import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { value, options, amount, CorrectIdx, categoryId } = body;

    // Validate required fields
    if (!value || !options || !amount || CorrectIdx === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate options array
    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { error: 'Question must have exactly 4 options' },
        { status: 400 }
      );
    }

    // Validate correct index
    if (CorrectIdx < 0 || CorrectIdx >= options.length) {
      return NextResponse.json(
        { error: 'Invalid correct answer index' },
        { status: 400 }
      );
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        value,
        options,
        amount,
        CorrectIdx,
        categoryId,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
} 