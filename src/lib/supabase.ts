import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, which bypasses Row Level
// Security, so this file must never be imported from client components.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://gadyuosmrfnorglumykc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZHl1b3NtcmZub3JnbHVteWtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDI3OTQ2OSwiZXhwIjoyMDk5ODU1NDY5fQ.R_rx2OY3IAesenwZMVrKfMDhr-24pveRARZZyc2v3Uo";

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
