// app/api/user/cart/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Define types for the API response


const calculateDiscountedPrice = (basePrice: number, subscriptionType?: string, subscriptionEnd?: string): number => {
  if (!subscriptionType || !subscriptionEnd) return basePrice;
  
  // Check if subscription has expired
  const subscriptionEndDate = new Date(subscriptionEnd);
  if (subscriptionEndDate < new Date()) return basePrice;

  switch (subscriptionType) {
    case "ONE_MONTH":
      return basePrice * 0.9; // 10% discount
    case "ONE_YEAR":
      return basePrice * 0.78; // 22% discount
    case "LIFETIME":
      return basePrice * 0.65; // 35% discount
    default:
      return basePrice;
  }
};

// Define the include type for Prisma queries
const cartInclude = {
  Cart: {
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user's cart
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: cartInclude,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user doesn't have a cart, create one
    if (!user.Cart) {
      const newCart = await prisma.cart.create({

        data: {
          userId: user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      console.log("New cart created:", newCart);
      return NextResponse.json({ items: [], totalPrice: 0, baseTotal: 0, discountTotal: 0 });
    }

    // Calculate totals
    const baseTotal = user.Cart.items.reduce(
      (sum: number, item) => sum + item.product.basePrice * item.quantity,
      0
    );

    // Transform the response to match the expected format
    const cartItems = user.Cart.items.map((item) => {
      const discountedPrice = calculateDiscountedPrice(
        item.product.basePrice,
        user.subscriptionType,
        user.subscriptionTypeEnd?.toISOString()
      );
      return {
        id: item.product.id,
        title: item.product.title,
        price: item.product.basePrice,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        discountedPrice
      };
    });

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0
    );

    const discountTotal = baseTotal - totalPrice;

    return NextResponse.json({
      items: cartItems,
      totalPrice: Number(totalPrice.toFixed(2)),
      baseTotal: Number(baseTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2))
    });
  } catch (error) {
    console.error("GET cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Add Item to Cart
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, price, quantity = 1 } = await req.json();

    // Validate required fields
    if (!id || !title || typeof price !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Get user and their cart
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: cartInclude,
      
      
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create cart if it doesn't exist
    let cart = user.Cart;
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find((item) => item.product.id === id);

    if (existingItem) {
      // Update quantity of existing item
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item to cart
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: id,
          quantity: quantity,
        },
      });
    }

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Transform the response
    const cartItems = updatedCart?.items.map((item) => {
      const discountedPrice = calculateDiscountedPrice(
        item.product.basePrice,
        user.subscriptionType,
        user.subscriptionTypeEnd?.toISOString()
      );
      return {
        id: item.product.id,
        title: item.product.title,
        price: item.product.basePrice,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        discountedPrice
      };
    }) || [];

    const baseTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0
    );

    const discountTotal = baseTotal - totalPrice;

    return NextResponse.json({
      items: cartItems,
      totalPrice: Number(totalPrice.toFixed(2)),
      baseTotal: Number(baseTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2))
    });
  } catch (error) {
    console.error("POST cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update Quantity of a Cart Item
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, quantity } = await req.json();

    if (!id || typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json(
        { error: "Invalid input: ID and valid quantity required" },
        { status: 400 }
      );
    }

    // Get user's cart
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: cartInclude,
    });

    if (!user?.Cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cartItem = user.Cart.items.find((item) => item.product.id === id);
    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });
    } else {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
      });
    }

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: user.Cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Transform the response
    const cartItems = updatedCart?.items.map((item) => {
      const discountedPrice = calculateDiscountedPrice(
        item.product.basePrice,
        user.subscriptionType,
        user.subscriptionTypeEnd?.toISOString()
      );
      return {
        id: item.product.id,
        title: item.product.title,
        price: item.product.basePrice,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        discountedPrice
      };
    }) || [];

    const baseTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0
    );

    const discountTotal = baseTotal - totalPrice;

    return NextResponse.json({
      items: cartItems,
      totalPrice: Number(totalPrice.toFixed(2)),
      baseTotal: Number(baseTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2))
    });
  } catch (error) {
    console.error("PUT cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove Item from Cart
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Get user's cart
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: cartInclude,
    });

    if (!user?.Cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cartItem = user.Cart.items.find((item) => item.product.id === id);
    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: user.Cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Transform the response
    const cartItems = updatedCart?.items.map((item) => {
      const discountedPrice = calculateDiscountedPrice(
        item.product.basePrice,
        user.subscriptionType,
        user.subscriptionTypeEnd?.toISOString()
      );
      return {
        id: item.product.id,
        title: item.product.title,
        price: item.product.basePrice,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        discountedPrice
      };
    }) || [];

    const baseTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0
    );

    const discountTotal = baseTotal - totalPrice;

    return NextResponse.json({
      items: cartItems,
      totalPrice: Number(totalPrice.toFixed(2)),
      baseTotal: Number(baseTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2))
    });
  } catch (error) {
    console.error("DELETE cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}