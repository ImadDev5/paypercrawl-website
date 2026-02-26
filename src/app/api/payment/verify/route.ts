import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyPaymentSignature } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId 
    } = body;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    // Find the payment record
    const { data: payment } = await sb
      .from('payments')
      .select('*')
      .eq('orderId', razorpay_order_id)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Verify userId matches (security check)
    if (userId && payment.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update payment record
    const { data: updatedPayment, error: updateErr } = await sb
      .from('payments')
      .update({
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'captured',
      })
      .eq('orderId', razorpay_order_id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    // Update user to have active plan (lifetime access)
    const { error: userErr } = await sb
      .from('users')
      .update({ hasActivePlan: true })
      .eq('id', payment.userId);
    if (userErr) throw userErr;

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: updatedPayment.id,
        orderId: updatedPayment.orderId,
        paymentId: updatedPayment.paymentId,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
