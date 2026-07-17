import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createLead } from "@/lib/leads";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    if (!formData?.name || !formData?.email) {
      return NextResponse.json({ error: "Missing required contact details" }, { status: 400 });
    }

    const leadId = `lead_${Math.random().toString(36).substring(2, 11)}`;

    // Save pending lead draft (best-effort, must not block payment setup)
    try {
      await createLead({ id: leadId, type: "build_ready", status: "pending", formData });
    } catch (e) {
      console.error("Failed to persist pending lead (non-fatal):", e);
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900, // $99.00 in cents
      currency: "usd",
      receipt_email: formData.email,
      metadata: {
        leadId,
        name: formData.name,
        email: formData.email,
        phone: `${formData.countryCode || ""}${formData.phone || ""}`
      },
      automatic_payment_methods: { enabled: true }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      leadId
    });
  } catch (error: any) {
    console.error("PaymentIntent creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
