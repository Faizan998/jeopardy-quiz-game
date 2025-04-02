import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import { PayPalClient } from "@/lib/paypal";

// Initialize PayPal client
const paypalClient = new PayPalClient(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!,
  process.env.NODE_ENV === "production"
);

// GET /api/user/orders/[id] - Get order details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if the order belongs to the user or if user is admin
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/orders/[id] - Update order status (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const order = await prisma.order.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// POST /api/user/orders/[id]/capture - Capture PayPal payment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if the order belongs to the user
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Capture the PayPal payment
    const captureResponse = await paypalClient.capturePayment(order.paymentReference!);

    if (captureResponse.status === "COMPLETED") {
      // Update order status and payment details
      const updatedOrder = await prisma.order.update({
        where: {
          id: params.id,
        },
        data: {
          status: "COMPLETED",
          paymentDetails: captureResponse,
        },
      });

      // Get subscription type from the purchase units description
      const subscriptionType = captureResponse.purchase_units?.[0]?.description?.match(/(ONE_MONTH|ONE_YEAR|LIFETIME)/)?.[0] as "ONE_MONTH" | "ONE_YEAR" | "LIFETIME" | undefined;

      if (subscriptionType) {
        const subscriptionEnd = new Date();
        if (subscriptionType === "ONE_MONTH") {
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        } else if (subscriptionType === "ONE_YEAR") {
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
        } else if (subscriptionType === "LIFETIME") {
          subscriptionEnd.setFullYear(9999); // Far future date for lifetime
        }

        await prisma.user.update({
          where: {
            id: session.user.id,
          },
          data: {
            subscriptionType,
            subscriptionTypeEnd: subscriptionEnd,
          },
        });
      }

      return NextResponse.json(updatedOrder);
    } else {
      return NextResponse.json(
        { error: "Payment capture failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error capturing payment:", error);
    return NextResponse.json(
      { error: "Failed to capture payment" },
      { status: 500 }
    );
  }
}