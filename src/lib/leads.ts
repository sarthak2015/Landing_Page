import fs from "fs";
import path from "path";
import { supabaseAdmin } from "./supabase";

export interface Lead {
  id: string;
  type: string;
  status: string;
  formData: any;
  booking: any;
  createdAt: string;
}

interface LeadRow {
  id: string;
  type: string;
  status: string;
  form_data: any;
  booking: any;
  created_at: string;
}

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    formData: row.form_data,
    booking: row.booking,
    createdAt: row.created_at
  };
}

// Disk file fallback helper
const getFilePath = () => {
  const tmpDir = process.env.TMPDIR || process.env.TMP || "/tmp";
  return path.join(tmpDir, "go_speed_leads.json");
};

// Memory cache for runtime persistence across API invocations
const memoryLeadsMap = new Map<string, Lead>();

function readLocalLeads(): Lead[] {
  try {
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed: Lead[] = JSON.parse(content);
      parsed.forEach((l) => memoryLeadsMap.set(l.id, l));
    }
  } catch (e) {
    console.warn("Error reading local leads file:", e);
  }
  return Array.from(memoryLeadsMap.values());
}

function writeLocalLeads(leads: Lead[]) {
  try {
    leads.forEach((l) => memoryLeadsMap.set(l.id, l));
    const filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(Array.from(memoryLeadsMap.values()), null, 2), "utf-8");
  } catch (e) {
    console.warn("Error writing local leads file:", e);
  }
}

export async function listLeads(): Promise<Lead[]> {
  const localLeads = readLocalLeads();

  try {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const remoteLeads = (data as LeadRow[]).map(rowToLead);
      const map = new Map<string, Lead>();
      remoteLeads.forEach((l) => map.set(l.id, l));
      localLeads.forEach((l) => map.set(l.id, l));
      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      writeLocalLeads(combined);
      return combined;
    }
  } catch (err: any) {
    console.warn("Supabase listLeads error (using local disk/memory fallback):", err?.message || err);
  }

  return localLeads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getLead(id: string): Promise<Lead | null> {
  const localLeads = readLocalLeads();
  const foundLocal = localLeads.find((l) => l.id === id);
  if (foundLocal) return foundLocal;

  try {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) return rowToLead(data as LeadRow);
  } catch (err) {
    console.warn("getLead Supabase fetch error:", err);
  }
  return null;
}

export async function createLead(lead: {
  id: string;
  type: string;
  status: string;
  formData: any;
  booking?: any;
}): Promise<Lead> {
  const newLead: Lead = {
    id: lead.id,
    type: lead.type,
    status: lead.status,
    formData: lead.formData,
    booking: lead.booking ?? null,
    createdAt: new Date().toISOString()
  };

  // Always store locally first so it is never lost
  const localLeads = readLocalLeads();
  const updatedList = [newLead, ...localLeads.filter((l) => l.id !== newLead.id)];
  writeLocalLeads(updatedList);

  try {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        id: lead.id,
        type: lead.type,
        status: lead.status,
        form_data: lead.formData,
        booking: lead.booking ?? null
      })
      .select()
      .single();

    if (!error && data) {
      const created = rowToLead(data as LeadRow);
      memoryLeadsMap.set(created.id, created);
      return created;
    }
  } catch (err: any) {
    console.warn("createLead Supabase error (saved locally):", err?.message || err);
  }

  return newLead;
}

export async function updateLead(
  id: string,
  updates: { status?: string; booking?: any }
): Promise<Lead | null> {
  const localLeads = readLocalLeads();
  let existing = localLeads.find((l) => l.id === id);
  if (existing) {
    existing = {
      ...existing,
      status: updates.status !== undefined ? updates.status : existing.status,
      booking: updates.booking !== undefined ? updates.booking : existing.booking
    };
    writeLocalLeads([existing, ...localLeads.filter((l) => l.id !== id)]);
  }

  try {
    const patch: Record<string, any> = {};
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.booking !== undefined) patch.booking = updates.booking;

    const { data, error } = await supabaseAdmin
      .from("leads")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (!error && data) {
      const updated = rowToLead(data as LeadRow);
      memoryLeadsMap.set(updated.id, updated);
      return updated;
    }
  } catch (err) {
    console.warn("updateLead Supabase fetch error:", err);
  }

  return existing || null;
}

export async function findLeadById(leadId: string): Promise<Lead | null> {
  return getLead(leadId);
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
}

export async function logNotification(
  title: string,
  message: string,
  type: "explore" | "booking" | "submit"
): Promise<void> {
  try {
    await supabaseAdmin.from("notifications").insert({
      id: `notif_${Math.random().toString(36).substring(2, 11)}`,
      title,
      message,
      type
    });
  } catch (err) {
    console.warn("logNotification warning:", err);
  }
}

export async function listNotifications(limit = 50): Promise<Notification[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type,
      timestamp: row.created_at
    }));
  } catch {
    return [];
  }
}
