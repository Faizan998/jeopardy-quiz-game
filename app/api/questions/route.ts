import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');

  if (!level) return NextResponse.json({ error: 'Level required' }, { status: 400 });

  const { data, error } = await supabase.from('questions').select('*').eq('level', level);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}