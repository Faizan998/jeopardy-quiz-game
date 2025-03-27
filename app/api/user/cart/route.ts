// app/api/user/cart/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define CartItem and Cart interfaces
interface CartItem {
  id: string;
  title: string;
  price: number; // Price is explicitly a number
  imageUrl: string;
  quantity: number;
}

interface Cart {
  items: CartItem[];
}

// In-memory storage (replace with a database in production)
let cart: Cart = { items: [] };

export async function GET() {
    // Calculate the total price based on current quantities
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    console.log("GET request:", cart);
  
    // Return the cart with items and total price
    const responseCart = {
      items: cart.items,
      totalPrice: Number(totalPrice.toFixed(2)), // Ensure 2 decimal places
    };
  
    return NextResponse.json(responseCart);
  }

// POST: Add Item to Cart
export async function POST(req: NextRequest) {
  try {
    const { id, title, price, imageUrl, quantity = 1 } = await req.json();
        console.log("POST request:", { id, title, price, imageUrl, quantity });
    // Validate required fields and ensure price is a number
    if (!id || !title || typeof price !== "number") {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    const existingItem = cart.items.find((item) => item.id === id);
    if (existingItem) {
      existingItem.quantity += quantity; // Increment quantity if item exists
    } else {
      const newItem: CartItem = { 
        id, 
        title, 
        price: Number(price), // Ensure price is stored as a number
        imageUrl, 
        quantity 
      };
      cart.items.push(newItem);
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// PUT: Update Quantity of a Cart Item (Increment/Decrement)
export async function PUT(req: NextRequest) {
  try {
    const { id, quantity } = await req.json();

    // Validate input
    if (!id || typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ error: "Invalid input: ID and valid quantity required" }, { status: 400 });
    }

    const item = cart.items.find((item) => item.id === id);
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Update quantity
    cart.items = cart.items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );

    // Remove item if quantity is 0
    cart.items = cart.items.filter((item) => item.quantity > 0);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// DELETE: Remove Item from Cart
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    cart.items = cart.items.filter((item) => item.id !== id);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}