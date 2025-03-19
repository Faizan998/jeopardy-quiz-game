import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const [totalUsers, totalQuestions, totalCategories, totalAnswers] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.category.count(),
      prisma.answer.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalQuestions,
      totalCategories,
      totalAnswers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 