import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getRazorpayInstance, convertToCents } from '@/lib/razorpay';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

const PLAN_PRICE_USD = 25; // $25 for API key access

export async function POST(request: NextRequest) {
  // Rate limit: 10 orders per minute per IP
  const ip = getClientIP(request.headers);
  const rl = rateLimit(`payment-create:${ip}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }
  try {
    const body = await request.json();
    const { email, name, userId } = body;

    // Validate input
    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    // Check if user already has an active plan
    const { data: existingUser } = await sb
      .from('users')
      .select('id, hasActivePlan')
      .eq('id', userId)
      .maybeSingle();

    if (existingUser?.hasActivePlan) {
      return NextResponse.json(
        { error: 'User already has an active plan' },
        { status: 400 }
      );
    }

    // Create or update user (upsert)
    let user;
    if (existingUser) {
      const { data: updated, error: ue } = await sb
        .from('users')
        .update({ email, name: name || email })
        .eq('id', userId)
        .select()
        .single();
      if (ue) throw ue;
      user = updated;
    } else {
      const { data: created, error: ce } = await sb
        .from('users')
        .insert({ id: userId, email, name: name || email, hasActivePlan: false })
        .select()
        .single();
      if (ce) throw ce;
      user = created;
    }

    // Create Razorpay order
    const razorpay = getRazorpayInstance();
    const amountInCents = convertToCents(PLAN_PRICE_USD);
    const receipt = `rcpt_${Date.now()}_${userId.substring(0, 8)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInCents, // Amount in cents (smallest unit for USD)
      currency: 'USD',
      receipt,
      notes: {
        userId,
        email,
        plan: 'api_key_access',
      },
    });

    // Save payment record in database
    const { data: payment, error: pe } = await sb
      .from('payments')
      .insert({
        userId: user.id,
        orderId: razorpayOrder.id,
        amount: amountInCents,
        currency: 'USD',
        status: 'created',
        receipt,
        notes: {
          plan: 'api_key_access',
          email,
        },
      })
      .select()
      .single();
    if (pe) throw pe;

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: amountInCents,
        currency: 'USD',
        receipt,
      },
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
