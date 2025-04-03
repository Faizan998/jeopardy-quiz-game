import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Fetch order from database
    const order = await prisma.order.findUnique({
      where: {
        id,
        userId: session.user.id, // Ensure user can only access their own orders
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

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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

    return NextResponse.json(responseOrder, { status: 200 });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}