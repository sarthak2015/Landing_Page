import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LEADS_FILE_PATH = path.join(process.cwd(), "src/data/leads.json");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("lead_id");

    if (!leadId) {
      return NextResponse.json({ error: "Missing lead_id parameter" }, { status: 400 });
    }

    if (!fs.existsSync(LEADS_FILE_PATH)) {
      return NextResponse.json({ error: "No leads database found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
    const leads = JSON.parse(fileContent || "[]");

    const lead = leads.find((l: any) => l.id === leadId);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error: any) {
    console.error("Lead data fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
