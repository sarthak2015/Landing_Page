import { NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

// Initialize Stripe with the Secret Key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const LEADS_FILE_PATH = path.join(process.cwd(), "src/data/leads.json");

// Helper to write lead to leads.json database
function savePendingLead(leadId: string, formData: any) {
  const dir = path.dirname(LEADS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let leads = [];
  if (fs.existsSync(LEADS_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(LEADS_FILE_PATH, "utf8");
      leads = JSON.parse(fileContent || "[]");
    } catch (e) {
      console.error("Error reading leads file, resetting:", e);
      leads = [];
    }
  }

  const newLead = {
    id: leadId,
    type: "build_ready",
    status: "pending",
    formData: formData,
    payment: null,
    booking: null,
    createdAt: new Date().toISOString()
  };

  leads.push(newLead);
  fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    if (!formData || !formData.name || !formData.email) {
      return NextResponse.json(
        { error: "Missing required contact details" },
        { status: 400 }
      );
    }

    // Generate a unique lead ID
    const leadId = `lead_${Math.random().toString(36).substring(2, 11)}`;

    // Save lead details as pending in leads.json
    savePendingLead(leadId, formData);

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Website Kickoff Package",
              description: "Build Slot Lock & Setup Consultation",
            },
            unit_amount: 9900, // Amount in cents ($99.00)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: formData.email,
      metadata: {
        leadId,
        name: formData.name,
        email: formData.email,
        phone: `${formData.countryCode}${formData.phone}`
      },
      // Redirect back with parameters
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}&lead_id=${leadId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/?payment_cancelled=true`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
