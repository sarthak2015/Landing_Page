import { supabaseAdmin } from "./supabase";

export interface Lead {
  id: string;
  type: string;
  status: string;
  formData: any;
  payment: any;
  booking: any;
  createdAt: string;
}

interface LeadRow {
  id: string;
  type: string;
  status: string;
  form_data: any;
  payment: any;
  booking: any;
  created_at: string;
}

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    formData: row.form_data,
    payment: row.payment,
    booking: row.booking,
    createdAt: row.created_at
  };
}

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as LeadRow[]).map(rowToLead);
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToLead(data as LeadRow) : null;
}

export async function createLead(lead: {
  id: string;
  type: string;
  status: string;
  formData: any;
  payment?: any;
  booking?: any;
}): Promise<Lead> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .insert({
      id: lead.id,
      type: lead.type,
      status: lead.status,
      form_data: lead.formData,
      payment: lead.payment ?? null,
      booking: lead.booking ?? null
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToLead(data as LeadRow);
}

export async function updateLead(
  id: string,
  updates: { status?: string; payment?: any; booking?: any }
): Promise<Lead | null> {
  const patch: Record<string, any> = {};
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.payment !== undefined) patch.payment = updates.payment;
  if (updates.booking !== undefined) patch.booking = updates.booking;

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToLead(data as LeadRow) : null;
}

export async function findLeadByOrderId(orderId: string): Promise<Lead | null> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .or(`id.eq.${orderId},payment->>orderId.eq.${orderId}`)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToLead(data as LeadRow) : null;
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
  type: "explore" | "booking" | "payment"
): Promise<void> {
  const { error } = await supabaseAdmin.from("notifications").insert({
    id: `notif_${Math.random().toString(36).substring(2, 11)}`,
    title,
    message,
    type
  });

  if (error) throw new Error(error.message);
}

export async function listNotifications(limit = 50): Promise<Notification[]> {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    timestamp: row.created_at
  }));
}
