import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        paymentReference: order.paymentReference,
        baseAmount: order.baseAmount,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        items: order.items.map((item) => ({
          productId: item.productId,
          title: item.product.title,
          imageUrl: item.product.imageUrl,
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
        })),
      }))
    );
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items, baseAmount, discountAmount, totalAmount, paymentReference, paymentDetails } = await req.json();

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        baseAmount,
        discountAmount,
        totalAmount,
        status: OrderStatus.PAYMENT_PENDING,
        paymentReference,
        paymentDetails,
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
        items: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}
