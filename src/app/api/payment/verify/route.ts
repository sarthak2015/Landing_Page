import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const LEADS_FILE_PATH = path.join(process.cwd(), "src/data/leads.json");

// Helper to ensure data folder and leads.json exist
function writeLeadToFile(leadData: any) {
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

  leads.push(leadData);
  fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");
}

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
      
      const newLead = {
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
        },
        booking: null, // to be scheduled in the next step
        createdAt: new Date().toISOString()
      };

      writeLeadToFile(newLead);
      return NextResponse.json({ verified: true, lead: newLead });
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

    // Save verified paid lead to JSON DB
    const newLead = {
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
      },
      booking: null,
      createdAt: new Date().toISOString()
    };

    writeLeadToFile(newLead);

    return NextResponse.json({ verified: true, lead: newLead });

  } catch (error: any) {
    console.error("Error in Payment Verification API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during verification." },
      { status: 500 }
    );
  }
}
