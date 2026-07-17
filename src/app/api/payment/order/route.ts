import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required parameters." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const amount = 9900; // $99 in cents / equivalent smallest currency unit

    // Check if we should run in Sandbox / Mock Mode
    if (!keyId || !keySecret) {
      console.log("Razorpay credentials not found in env. Running in Sandbox Mode.");
      // Create a simulated Razorpay order response
      return NextResponse.json({
        id: `order_mock_${Math.random().toString(36).substring(2, 15)}`,
        amount: amount,
        currency: "USD",
        notes: {
          name,
          email,
          phone,
          isMock: "true"
        }
      });
    }

    // Call real Razorpay API if credentials are provided
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    
    // We try USD first. If the merchant account does not support USD orders, 
    // Razorpay will fail. In real deployment, the developer can change currency to INR.
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: amount, // 9900 cents
        currency: "USD",
        receipt: `receipt_landing_${Date.now()}`,
        notes: {
          name,
          email,
          phone,
          isMock: "false"
        }
      })
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error("Razorpay Order Creation Failed:", errorData);
      
      // If USD is not supported, attempt INR backup (9900 paise = ₹99, or ₹8200 = ~$99)
      // Let's attempt to fallback to ₹8,200 INR (amount = 820000 paise)
      console.log("Attempting INR fallback order...");
      const fallbackResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`
        },
        body: JSON.stringify({
          amount: 820000, // ₹8,200 INR
          currency: "INR",
          receipt: `receipt_landing_${Date.now()}`,
          notes: {
            name,
            email,
            phone,
            isMock: "false"
          }
        })
      });

      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.json();
        throw new Error(fallbackError.error?.description || "Razorpay API error");
      }

      const fallbackOrder = await fallbackResponse.json();
      return NextResponse.json(fallbackOrder);
    }

    const order = await razorpayResponse.json();
    return NextResponse.json(order);

  } catch (error: any) {
    console.error("Error creating Razorpay Order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
