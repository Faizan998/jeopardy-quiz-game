import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        totalAmount: 0,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error resetting user score:', error);
    return NextResponse.json({ error: 'Failed to reset user score' }, { status: 500 });
  }
} 