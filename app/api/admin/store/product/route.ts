import { NextResponse } from 'next/server';
import { PrismaClient, Product } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProductData {
  categoryId: string;
  title: string;
  description: string;
  basePrice: string;
}

// POST: Create a new product
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const productData: ProductData = JSON.parse(formData.get('product') as string);

    // Validate required fields
    if (!productData.categoryId || !productData.title || !productData.basePrice) {
      return NextResponse.json(
        { error: 'Missing categoryId, title, or basePrice' },
        { status: 400 }
      );
    }

    // Upload image to Supabase Storage if provided
    let imageUrl = '';
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('store-product-images').upload(fileName, file);

      if (error) {
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
      }

      const { data } = supabase.storage.from('store-product-images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    // Create product in Prisma
    const product: Product = await prisma.product.create({
      data: {
        name: productData.title,
        description: productData.description,
        basicPrice: parseFloat(productData.basePrice),
        imageUrl: imageUrl,
        categoryId: productData.categoryId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Something went wrong', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET: Retrieve all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        basicPrice: true,
        imageUrl: true,
        categoryId: true,
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
