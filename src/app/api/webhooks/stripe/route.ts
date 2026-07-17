import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const LEADS_FILE_PATH = path.join(process.cwd(), "src/data/leads.json");

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const leadId = session.metadata?.leadId;

    if (leadId) {
      // Mark lead as paid in local database (leads.json)
      if (fs.existsSync(LEADS_FILE_PATH)) {
        try {
          const fileContent = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
          const leads = JSON.parse(fileContent || "[]");
          
          const leadIndex = leads.findIndex((l: any) => l.id === leadId);
          if (leadIndex !== -1) {
            leads[leadIndex].status = "paid";
            leads[leadIndex].payment = {
              orderId: session.id,
              paymentId: session.payment_intent as string,
              amount: 99.00,
              currency: "USD",
              verified: true,
              method: "stripe_checkout"
            };
            fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");
            console.log(`Lead ${leadId} successfully marked as PAID via Stripe Checkout Webhook.`);
          }
        } catch (e) {
          console.error("Webhook database update error:", e);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
