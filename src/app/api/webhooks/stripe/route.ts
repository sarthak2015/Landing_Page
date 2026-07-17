import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateLead } from "@/lib/leads";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

async function markLeadPaid(leadId: string, paymentId: string) {
  try {
    await updateLead(leadId, {
      status: "paid",
      payment: {
        orderId: paymentId,
        paymentId,
        amount: 99.00,
        currency: "USD",
        verified: true,
        method: "stripe_elements"
      }
    });
    console.log(`Lead ${leadId} marked as PAID via Stripe.`);
  } catch (e) {
    console.error("Webhook DB update error:", e);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const leadId = intent.metadata?.leadId;
    if (leadId) await markLeadPaid(leadId, intent.id);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const leadId = session.metadata?.leadId;
    if (leadId) await markLeadPaid(leadId, session.payment_intent as string);
  }

  return NextResponse.json({ received: true });
}
