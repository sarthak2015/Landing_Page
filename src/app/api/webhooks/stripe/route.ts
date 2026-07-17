import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const LEADS_FILE_PATH = path.join(process.cwd(), "src/data/leads.json");

function markLeadPaid(leadId: string, paymentId: string) {
  if (!fs.existsSync(LEADS_FILE_PATH)) return;
  try {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, "utf-8") || "[]");
    const idx = leads.findIndex((l: any) => l.id === leadId);
    if (idx !== -1) {
      leads[idx].status = "paid";
      leads[idx].payment = {
        orderId: paymentId,
        paymentId,
        amount: 99.00,
        currency: "USD",
        verified: true,
        method: "stripe_elements"
      };
      fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");
      console.log(`Lead ${leadId} marked as PAID via Stripe.`);
    }
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
    if (leadId) markLeadPaid(leadId, intent.id);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const leadId = session.metadata?.leadId;
    if (leadId) markLeadPaid(leadId, session.payment_intent as string);
  }

  return NextResponse.json({ received: true });
}
