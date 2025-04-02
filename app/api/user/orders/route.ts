import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import { PayPalClient } from "@/lib/paypal";

// Initialize PayPal client
const paypalClient = new PayPalClient(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!,
  process.env.NODE_ENV === "production"
);

// GET /api/user/orders - Get all orders for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/user/orders - Create a new order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionType, items, baseAmount, discountAmount, totalAmount } = body;

    // Handle subscription orders
    if (subscriptionType) {
      let amount = 0;
      switch (subscriptionType) {
        case "ONE_MONTH":
          amount = 99;
          break;
        case "ONE_YEAR":
          amount = 299;
          break;
        case "LIFETIME":
          amount = 2999;
          break;
        default:
          return NextResponse.json(
            { error: "Invalid subscription type" },
            { status: 400 }
          );
      }

      // Create subscription order
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          totalAmount: amount,
          baseAmount: amount,
          discountAmount: 0,
          status: "PAYMENT_PENDING"
        },
      });

      // Create PayPal order for subscription
      const paypalOrder = await paypalClient.createOrder({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
            description: `${subscriptionType} Subscription`,
          },
        ],
      });

      return NextResponse.json({ 
        orderId: order.id,
        approvalUrl: paypalOrder.links.find((link: any) => link.rel === "approve")?.href 
      });
    }

    // Handle regular orders (non-subscription)
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        baseAmount,
        discountAmount,
        status: "COMPLETED",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discountedPrice: item.discountedPrice
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Clear the user's cart after successful order
    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id
      }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id
        }
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}