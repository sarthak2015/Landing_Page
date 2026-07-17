import { NextResponse } from "next/server";
import { createLead, findLeadByOrderId, listLeads, listNotifications, logNotification, updateLead } from "@/lib/leads";
import { verifySessionToken } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [leads, notifs] = await Promise.all([listLeads(), listNotifications()]);
    return NextResponse.json({ leads, notifications: notifs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch leads data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    // --- CASE 1: Explore Lead Callback request (Path B) ---
    if (type === "explore") {
      const { formData } = body;

      if (!formData || !formData.name || !formData.phone || !formData.email) {
        return NextResponse.json({ error: "Missing required fields for callback request" }, { status: 400 });
      }

      const newLead = await createLead({
        id: `lead_${Math.random().toString(36).substring(2, 11)}`,
        type: "explore_callback",
        status: "pending_call",
        formData,
        booking: {
          date: null,
          time: formData.bestTime, // stores pref window
          formattedDateTime: `Call window: ${formData.bestTime}`
        }
      });

      await logNotification(
        "📞 New Explorer Callback Lead",
        `${formData.name} requested a call window [${formData.bestTime}] for business: ${formData.businessName || "Not named yet"}. Phone: ${formData.phone}`,
        "explore"
      );

      console.log(`[SLACK NOTIFICATION MOCK] 📞 New Lead callback: ${formData.name} - ${formData.phone}`);

      return NextResponse.json({ success: true, lead: newLead });
    }

    // --- CASE 2: Call Booking / Scheduling (Path A Step 3) ---
    if (type === "booking") {
      const { orderId, bookingDetails, formData } = body;

      if (!orderId || !bookingDetails) {
        return NextResponse.json({ error: "Missing orderId or bookingDetails" }, { status: 400 });
      }

      // Find the paid order matching this order ID or direct Lead ID
      const existingLead = await findLeadByOrderId(orderId) ?? (body.leadId ? await findLeadByOrderId(body.leadId) : null);

      if (!existingLead) {
        // If for some reason the lead record wasn't stored (e.g. direct sandbox page load),
        // create a new one to avoid failing
        console.warn("Lead not found for booking, creating new record.");
        const fallbackLead = await createLead({
          id: `lead_${Math.random().toString(36).substring(2, 11)}`,
          type: "build_ready",
          status: "scheduled",
          formData,
          payment: {
            orderId,
            paymentId: body.paymentId || "simulated",
            amount: 99.00,
            verified: true,
            method: "sandbox_direct"
          },
          booking: bookingDetails
        });

        await logNotification(
          "📅 New Kickoff Call Scheduled",
          `${formData.name} has scheduled their kickoff call for ${bookingDetails.formattedDateTime}`,
          "booking"
        );
        return NextResponse.json({ success: true, lead: fallbackLead });
      }

      // Update existing lead record
      const updatedLead = await updateLead(existingLead.id, {
        booking: bookingDetails,
        status: "scheduled"
      });

      await logNotification(
        "📅 New Kickoff Call Scheduled",
        `${existingLead.formData.name} has scheduled their kickoff call for ${bookingDetails.formattedDateTime}`,
        "booking"
      );

      console.log(`[SLACK NOTIFICATION MOCK] 📅 Call Scheduled: ${existingLead.formData.name} on ${bookingDetails.formattedDateTime}`);

      return NextResponse.json({ success: true, lead: updatedLead });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });

  } catch (error: any) {
    console.error("Error in Leads API:", error);
    return NextResponse.json({ error: error.message || "Failed to process lead." }, { status: 500 });
  }
}
