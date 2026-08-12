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

// In-memory fallback storage when Supabase network is unreachable or offline
const fallbackLeadsMap = new Map<string, Lead>();

export async function listLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase query warning (using fallback store):", error.message);
      return Array.from(fallbackLeadsMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const remoteLeads = (data as LeadRow[]).map(rowToLead);
    
    // Merge remote leads with fallback leads to ensure no submissions are missed
    remoteLeads.forEach((l) => fallbackLeadsMap.set(l.id, l));

    return Array.from(fallbackLeadsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err: any) {
    console.warn("Supabase fetch failed (returning local memory leads):", err?.message || err);
    return Array.from(fallbackLeadsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export async function getLead(id: string): Promise<Lead | null> {
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
  return fallbackLeadsMap.get(id) || null;
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

  // Always store in memory fallback first
  fallbackLeadsMap.set(newLead.id, newLead);

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
      fallbackLeadsMap.set(created.id, created);
      return created;
    } else if (error) {
      console.warn("createLead Supabase error (saved to fallback store):", error.message);
    }
  } catch (err: any) {
    console.warn("createLead fetch failed (saved to local fallback store):", err?.message || err);
  }

  return newLead;
}

export async function updateLead(
  id: string,
  updates: { status?: string; booking?: any }
): Promise<Lead | null> {
  let existing = fallbackLeadsMap.get(id);
  if (existing) {
    existing = {
      ...existing,
      status: updates.status !== undefined ? updates.status : existing.status,
      booking: updates.booking !== undefined ? updates.booking : existing.booking
    };
    fallbackLeadsMap.set(id, existing);
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
      fallbackLeadsMap.set(updated.id, updated);
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
