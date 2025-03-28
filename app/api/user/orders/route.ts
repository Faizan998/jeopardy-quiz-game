import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

// GET /api/user/orders - Get user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/user/orders - Create new order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, baseAmount, discountAmount, totalAmount } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        baseAmount,
        discountAmount,
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discountedPrice: item.discountedPrice
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Clear cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/user/orders/[id] - Update order status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate status transition
    if (status === 'CANCELLED') {
      // Only allow cancellation of PENDING orders
      if (order.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Only pending orders can be cancelled' },
          { status: 400 }
        );
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 