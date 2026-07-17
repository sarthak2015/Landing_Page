import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LEADS_FILE_PATH = path.join(process.cwd(), "src/data/leads.json");
const NOTIFS_FILE_PATH = path.join(process.cwd(), "src/data/notifications.json");

// Helper to save notifications
function logNotification(title: string, message: string, type: "explore" | "booking" | "payment") {
  const dir = path.dirname(NOTIFS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let notifs = [];
  if (fs.existsSync(NOTIFS_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(NOTIFS_FILE_PATH, "utf8");
      notifs = JSON.parse(fileContent || "[]");
    } catch (e) {
      notifs = [];
    }
  }

  notifs.unshift({
    id: `notif_${Math.random().toString(36).substring(2, 11)}`,
    title,
    message,
    type,
    timestamp: new Date().toISOString()
  });

  // Limit to 50 logs to avoid file bloat
  fs.writeFileSync(NOTIFS_FILE_PATH, JSON.stringify(notifs.slice(0, 50), null, 2), "utf8");
}

export async function GET() {
  try {
    // Read Leads
    let leads = [];
    if (fs.existsSync(LEADS_FILE_PATH)) {
      leads = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, "utf8") || "[]");
    }

    // Read Notifications
    let notifs = [];
    if (fs.existsSync(NOTIFS_FILE_PATH)) {
      notifs = JSON.parse(fs.readFileSync(NOTIFS_FILE_PATH, "utf8") || "[]");
    }

    return NextResponse.json({ leads, notifications: notifs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch leads data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    const dir = path.dirname(LEADS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // --- CASE 1: Explore Lead Callback request (Path B) ---
    if (type === "explore") {
      const { formData } = body;

      if (!formData || !formData.name || !formData.phone || !formData.email) {
        return NextResponse.json({ error: "Missing required fields for callback request" }, { status: 400 });
      }

      let leads = [];
      if (fs.existsSync(LEADS_FILE_PATH)) {
        leads = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, "utf8") || "[]");
      }

      const newLead = {
        id: `lead_${Math.random().toString(36).substring(2, 11)}`,
        type: "explore_callback",
        status: "pending_call",
        formData,
        payment: null,
        booking: {
          date: null,
          time: formData.bestTime, // stores pref window
          formattedDateTime: `Call window: ${formData.bestTime}`
        },
        createdAt: new Date().toISOString()
      };

      leads.push(newLead);
      fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");

      // Log notification
      logNotification(
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

      let leads = [];
      if (fs.existsSync(LEADS_FILE_PATH)) {
        leads = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, "utf8") || "[]");
      }

      // Find the paid order matching this order ID or direct Lead ID
      let leadIndex = leads.findIndex((l: any) => l.payment?.orderId === orderId || l.id === orderId || l.id === body.leadId);

      if (leadIndex === -1) {
        // If for some reason the lead record wasn't stored (e.g. direct sandbox page load), 
        // create a new one to avoid failing
        console.warn("Lead not found for booking, creating new record.");
        const fallbackLead = {
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
          booking: bookingDetails,
          createdAt: new Date().toISOString()
        };
        leads.push(fallbackLead);
        fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");

        logNotification(
          "📅 New Kickoff Call Scheduled",
          `${formData.name} has scheduled their kickoff call for ${bookingDetails.formattedDateTime}`,
          "booking"
        );
        return NextResponse.json({ success: true, lead: fallbackLead });
      }

      // Update existing lead record
      leads[leadIndex].booking = bookingDetails;
      leads[leadIndex].status = "scheduled";

      fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");

      const name = leads[leadIndex].formData.name;
      logNotification(
        "📅 New Kickoff Call Scheduled",
        `${name} has scheduled their kickoff call for ${bookingDetails.formattedDateTime}`,
        "booking"
      );

      console.log(`[SLACK NOTIFICATION MOCK] 📅 Call Scheduled: ${name} on ${bookingDetails.formattedDateTime}`);

      return NextResponse.json({ success: true, lead: leads[leadIndex] });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });

  } catch (error: any) {
    console.error("Error in Leads API:", error);
    return NextResponse.json({ error: error.message || "Failed to process lead." }, { status: 500 });
  }
}
