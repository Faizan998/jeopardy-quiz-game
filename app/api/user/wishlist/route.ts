import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

// GET /api/user/wishlist - Get user's wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!wishlist) {
      // Create wishlist if it doesn't exist
      const newWishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Calculate discounted prices for items
      const itemsWithDiscounts = newWishlist.items.map(item => ({
        ...item,
        discountedPrice: calculateDiscountedPrice(
          item.product.basePrice,
          session.user.subscriptionType,
          session.user.subscriptionTypeEnd
        )
      }));

      return NextResponse.json({
        ...newWishlist,
        items: itemsWithDiscounts,
        subscription: {
          type: session.user.subscriptionType,
          endDate: session.user.subscriptionTypeEnd
        }
      });
    }

    // Calculate discounted prices for items
    const itemsWithDiscounts = wishlist.items.map(item => ({
      ...item,
      discountedPrice: calculateDiscountedPrice(
        item.product.basePrice,
        session.user.subscriptionType,
        session.user.subscriptionTypeEnd
      )
    }));

    return NextResponse.json({
      ...wishlist,
      items: itemsWithDiscounts,
      subscription: {
        type: session.user.subscriptionType,
        endDate: session.user.subscriptionTypeEnd
      }
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to calculate discounted price
function calculateDiscountedPrice(basePrice: number, subscriptionType?: string, subscriptionEnd?: string): number {
  if (!subscriptionType || !subscriptionEnd) return basePrice;
  
  const subscriptionEndDate = new Date(subscriptionEnd);
  if (subscriptionEndDate < new Date()) return basePrice;

  switch (subscriptionType) {
    case "ONE_MONTH":
      return Math.round(basePrice * 0.9 * 100) / 100; // 10% discount
    case "ONE_YEAR":
      return Math.round(basePrice * 0.78 * 100) / 100; // 22% discount
    case "LIFETIME":
      return Math.round(basePrice * 0.65 * 100) / 100; // 35% discount
    default:
      return basePrice;
  }
}

// POST /api/user/wishlist - Add item to wishlist
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.user.id }
      });
    }

    // Check if item already exists
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId
      }
    });

    if (existingItem) {
      return NextResponse.json({ error: 'Item already in wishlist' }, { status: 400 });
    }

    // Add item to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(wishlistItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/user/wishlist - Remove item from wishlist
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id }
    });

    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId
      }
    });

    return NextResponse.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 