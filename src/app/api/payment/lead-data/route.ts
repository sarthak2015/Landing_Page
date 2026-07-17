import { NextResponse } from "next/server";
import { getLead } from "@/lib/leads";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("lead_id");

    if (!leadId) {
      return NextResponse.json({ error: "Missing lead_id parameter" }, { status: 400 });
    }

    const lead = await getLead(leadId);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error: any) {
    console.error("Lead data fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
