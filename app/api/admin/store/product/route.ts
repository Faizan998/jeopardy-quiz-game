// app/api/admin/store/product/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

interface ProductData {
  categoryId: string;
  title: string;
  description: string;
  basePrice?: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    console.log('FormData received:', Array.from(formData.entries())); // Log incoming data
    const file = formData.get('image') as File | null;
    const productDataRaw = formData.get('product');
    const productData: ProductData = productDataRaw ? JSON.parse(productDataRaw as string) : {};

    console.log('Parsed productData:', productData); // Log parsed data

    // Validate required fields
    if (!productData.title || !productData.categoryId || !productData.description) {
      console.log('Validation failed:', { title: productData.title, categoryId: productData.categoryId, description: productData.description });
      return NextResponse.json(
        { error: 'Missing title, categoryId, or description' },
        { status: 400 }
      );
    }

    // Upload image to Supabase Storage if provided
    let imageUrl = '';
    if (file) {
      console.log('Uploading file:', file.name);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('jeopardy-quiz')
        .upload(fileName, file);

      if (error) {
        console.error('Supabase upload error:', error);
        return NextResponse.json({ error: 'Image upload failed', details: error.message }, { status: 500 });
      }

      const { data } = supabase.storage.from('jeopardy-quiz').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
      console.log('Image uploaded, URL:', imageUrl);
    }

    // Create product in Prisma
    console.log('Creating product with data:', { ...productData, imageUrl });
    const product = await prisma.product.create({
      data: {
        categoryId: productData.categoryId,
        title: productData.title,
        description: productData.description,
        imageUrl: imageUrl || '',
        basePrice: parseFloat(productData.basePrice || '0.0'),
      },
    });

    console.log('Product created:', product);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Something went wrong', details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        categoryId: true,
        title: true,
        description: true,
        imageUrl: true,
        basePrice: true,
        createdAt: true,
        updated_at: true,
        category: {
          select: {
            id: true,
            name: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



// PUT: Update an existing product
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    console.log('FormData received:', Array.from(formData.entries()));
    const file = formData.get('image') as File | null;
    const productDataRaw = formData.get('product');
    const productData: ProductData & { id: string } = productDataRaw ? JSON.parse(productDataRaw as string) : {};

    console.log('Parsed productData:', productData);

    if (!productData.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!productData.title || !productData.categoryId || !productData.description) {
      console.log('Validation failed:', { title: productData.title, categoryId: productData.categoryId, description: productData.description });
      return NextResponse.json(
        { error: 'Missing title, categoryId, or description' },
        { status: 400 }
      );
    }

    // Check if the product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productData.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let imageUrl = existingProduct.imageUrl;
    if (file) {
      // Delete old image if it exists
      if (existingProduct.imageUrl) {
        const oldFileName = existingProduct.imageUrl.split('/').pop();
        if (oldFileName) {
          const { error: deleteError } = await supabase.storage
            .from('jeopardy-quiz')
            .remove([oldFileName]);
          if (deleteError) {
            console.error('Failed to delete old image:', deleteError);
          }
        }
      }

      // Upload new image
      console.log('Uploading new file:', file.name);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('jeopardy-quiz')
        .upload(fileName, file);

      if (error) {
        console.error('Supabase upload error:', error);
        return NextResponse.json({ error: 'Image upload failed', details: error.message }, { status: 500 });
      }

      const { data } = supabase.storage.from('jeopardy-quiz').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
      console.log('New image uploaded, URL:', imageUrl);
    }

    // Update product in Prisma
    console.log('Updating product with data:', { ...productData, imageUrl });
    const updatedProduct = await prisma.product.update({
      where: { id: productData.id },
      data: {
        categoryId: productData.categoryId,
        title: productData.title,
        description: productData.description,
        imageUrl: imageUrl || '',
        basePrice: parseFloat(productData.basePrice || '0.0'),
      },
    });

    console.log('Product updated:', updatedProduct);
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json(
      { error: 'Something went wrong', details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

