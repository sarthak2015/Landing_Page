import { NextResponse } from "next/server";
import crypto from "crypto";
import { createLead } from "@/lib/leads";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, formData } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !formData) {
      return NextResponse.json(
        { error: "Order ID, Payment ID, and Form Data are required." },
        { status: 400 }
      );
    }

    // Check if it's a mock order
    if (razorpay_order_id.startsWith("order_mock_")) {
      console.log("Verifying Sandbox/Mock payment...");

      const lead = await createLead({
        id: `lead_${Math.random().toString(36).substring(2, 11)}`,
        type: "build_ready",
        status: "paid",
        formData,
        payment: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: 99.00,
          currency: "USD",
          verified: true,
          method: "sandbox_simulated"
        }
      });

      return NextResponse.json({ verified: true, lead });
    }

    // Real Signature Verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured on server." },
        { status: 500 }
      );
    }

    if (!razorpay_signature) {
      return NextResponse.json(
        { error: "Cryptographic signature is required for real verification." },
        { status: 400 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn("Payment verification signature mismatch.");
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    // Save verified paid lead
    const lead = await createLead({
      id: `lead_${Math.random().toString(36).substring(2, 11)}`,
      type: "build_ready",
      status: "paid",
      formData,
      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: 99.00, // or ₹8,200 depending on final currency
        verified: true,
        method: "razorpay_checkout"
      }
    });

    return NextResponse.json({ verified: true, lead });

  } catch (error: any) {
    console.error("Error in Payment Verification API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during verification." },
      { status: 500 }
    );
  }
}
