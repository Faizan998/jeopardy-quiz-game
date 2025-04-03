import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, baseAmount, discountAmount, totalAmount } = await req.json();

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        baseAmount,
        discountAmount,
        totalAmount,
        status: "PENDING", // Initial status from your OrderStatus enum
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discountedPrice: item.discountedPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    // Find the user's cart
    const userCart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (userCart) {
      // Clear user's cart items after successful order
      await prisma.cartItem.deleteMany({
        where: {
          cartId: userCart.id,
        },
      });
    }

    // Format response
    const responseOrder = {
      id: order.id,
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.product.title,
        imageUrl: item.product.imageUrl,
        price: item.price,
        quantity: item.quantity,
        discountedPrice: item.discountedPrice,
      })),
      baseAmount: order.baseAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      status: order.status,
      paymentReference: order.paymentReference, // Include if needed
      paymentDetails: order.paymentDetails,     // Include if needed
    };

    return NextResponse.json(responseOrder, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}