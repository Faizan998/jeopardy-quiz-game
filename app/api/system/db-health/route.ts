import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    // Execute a simple query to verify database connection
    await prisma.$queryRaw`SELECT 1`;

    return new NextResponse(
      JSON.stringify({ 
        status: 'healthy',
        message: 'Database connection is working properly'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Database connection error:', error);
    
    return new NextResponse(
      JSON.stringify({
        status: 'unhealthy',
        message: 'Failed to connect to the database',
        error: error instanceof Error ? error.message : 'Unknown error',
        connection: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : // Hide the password
          'No connection string found'
      }),
      { status: 503 }
    );
  }
} 