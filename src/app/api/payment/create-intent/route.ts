import { NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const LEADS_FILE_PATH = path.join(process.cwd(), "src/data/leads.json");

function savePendingLead(leadId: string, formData: any) {
  const dir = path.dirname(LEADS_FILE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let leads: any[] = [];
  if (fs.existsSync(LEADS_FILE_PATH)) {
    try {
      leads = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, "utf8") || "[]");
    } catch {
      leads = [];
    }
  }

  leads.push({
    id: leadId,
    type: "build_ready",
    status: "pending",
    formData,
    payment: null,
    booking: null,
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    if (!formData?.name || !formData?.email) {
      return NextResponse.json({ error: "Missing required contact details" }, { status: 400 });
    }

    const leadId = `lead_${Math.random().toString(36).substring(2, 11)}`;

    // Save pending lead draft
    savePendingLead(leadId, formData);

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
