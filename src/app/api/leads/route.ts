import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createLead, findLeadById, listLeads, listNotifications, logNotification, updateLead } from "@/lib/leads";
import { verifySessionToken } from "@/lib/adminAuth";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@go-techsolution.com";

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

    // --- CASE 1: Initial form submission ---
    if (type === "submit") {
      const { formData } = body;

      if (!formData || !formData.name || !formData.phone || !formData.email) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const newLead = await createLead({
        id: `lead_${Math.random().toString(36).substring(2, 11)}`,
        type: "build_ready",
        status: "pending_booking",
        formData
      });

      await logNotification(
        "📋 New Lead Submitted",
        `${formData.name} submitted their website requirements (${formData.websiteType || "type not set"}). Email: ${formData.email}`,
        "submit"
      );

      return NextResponse.json({ success: true, lead: newLead });
    }

    // --- CASE 2: Call Booking via Calendly ---
    if (type === "booking") {
      const { leadId, bookingDetails, formData } = body;

      if (!bookingDetails) {
        return NextResponse.json({ error: "Missing bookingDetails" }, { status: 400 });
      }

      const existingLead = leadId ? await findLeadById(leadId) : null;

      let lead;
      if (!existingLead) {
        lead = await createLead({
          id: `lead_${Math.random().toString(36).substring(2, 11)}`,
          type: "build_ready",
          status: "scheduled",
          formData,
          booking: bookingDetails
        });
      } else {
        lead = await updateLead(existingLead.id, {
          booking: bookingDetails,
          status: "scheduled"
        });
      }

      const name = formData?.name || existingLead?.formData?.name || "there";
      const email = formData?.email || existingLead?.formData?.email;
      const websiteType = formData?.websiteType || existingLead?.formData?.websiteType || "website";
      const pages: string[] = formData?.selectedPages || existingLead?.formData?.selectedPages || [];
      const features: string[] = formData?.selectedFeatures || existingLead?.formData?.selectedFeatures || [];

      // Send confirmation email
      if (email) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Your Kickoff Call is Confirmed — Go-Speed",
          html: buildConfirmationEmail({ name, websiteType, pages, features })
        }).catch((err) => console.error("Resend error:", err));
      }

      await logNotification(
        "📅 Kickoff Call Scheduled",
        `${name} booked their kickoff call. Email confirmation sent to ${email}.`,
        "booking"
      );

      return NextResponse.json({ success: true, lead });
    }

    // --- CASE 3: Explore Lead Callback (Path B) ---
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
          time: formData.bestTime,
          formattedDateTime: `Call window: ${formData.bestTime}`
        }
      });

      await logNotification(
        "📞 New Explorer Callback Lead",
        `${formData.name} requested a call window [${formData.bestTime}] for business: ${formData.businessName || "Not named yet"}. Phone: ${formData.phone}`,
        "explore"
      );

      return NextResponse.json({ success: true, lead: newLead });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });

  } catch (error: any) {
    console.error("Error in Leads API:", error);
    return NextResponse.json({ error: error.message || "Failed to process lead." }, { status: 500 });
  }
}

function buildConfirmationEmail({ name, websiteType, pages, features }: {
  name: string;
  websiteType: string;
  pages: string[];
  features: string[];
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kickoff Call Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Go-Speed</p>
              <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;">48-Hour Website Delivery</p>
            </td>
          </tr>
          <!-- Green success bar -->
          <tr>
            <td style="background:#10b981;padding:16px 40px;text-align:center;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">✓ Your Kickoff Call is Confirmed!</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Your kickoff call has been scheduled! We've received your website requirements and look forward to speaking with you. Check the Calendly confirmation email for the exact date and time.
              </p>

              <!-- Summary box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Your Requirements Summary</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#374151;font-weight:600;width:140px;">Website Type</td>
                        <td style="padding:6px 0;font-size:14px;color:#475569;">${websiteType}</td>
                      </tr>
                      ${pages.length > 0 ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#374151;font-weight:600;vertical-align:top;">Pages</td>
                        <td style="padding:6px 0;font-size:14px;color:#475569;">${pages.join(", ")}</td>
                      </tr>` : ""}
                      ${features.length > 0 ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#374151;font-weight:600;vertical-align:top;">Features</td>
                        <td style="padding:6px 0;font-size:14px;color:#475569;">${features.join(", ")}</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Prep list -->
              <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#0f172a;">Prepare for your call:</p>
              <ul style="margin:0 0 24px;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">
                <li>Brand assets — logo, colors, font preferences</li>
                <li>Reference websites you love the look of</li>
                <li>Draft copy or bullet points about your services</li>
                <li>Any high-res images or portfolio assets</li>
              </ul>

              <!-- SLA badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:4px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;">⚡ Our 48-Hour SLA Guarantee</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#3b82f6;line-height:1.5;">Your draft website will be built, optimised, and live within 48 hours of your kickoff call.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#64748b;">
                Questions? Reply to this email or reach us at <a href="mailto:dhruv@go-techsolution.com" style="color:#3b82f6;text-decoration:none;">dhruv@go-techsolution.com</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Go-Speed · go-techsolution.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
