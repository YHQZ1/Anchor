// app/api/onboarding/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// POST - Complete onboarding
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const { student_id } = await request.json();

    // Update user profile with onboarding data
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: decoded.id,
        student_id,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Onboarding completed successfully',
      onboarding_completed: true 
    });

  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Check onboarding status
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get user profile from database
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('onboarding_completed, student_id')
      .eq('id', decoded.id)
      .single();

    if (error) {
      // If no profile found, user hasn't completed onboarding
      return NextResponse.json({ 
        onboarding_completed: false,
        student_id: null
      });
    }

    return NextResponse.json({ 
      onboarding_completed: profile?.onboarding_completed || false,
      student_id: profile?.student_id || null
    });

  } catch (error) {
    console.error('Onboarding check error:', error);
    return NextResponse.json({ 
      onboarding_completed: false,
      student_id: null 
    }, { status: 500 });
  }
}