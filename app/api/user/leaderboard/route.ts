import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const users = await prisma.user.findMany({
        where: {
            role: 'USER'  // Only fetch users with role 'USER'
          },
          select: {
            id: true,
            name: true,
            totalAmount: true,
            role: true,
          },
          orderBy: {
            totalAmount: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 