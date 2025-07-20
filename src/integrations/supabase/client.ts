// src/integrations/supabase/client.ts
// =======================================================
// Cliente Supabase (Browser) - usar APENAS a anon/public key
// Nunca coloque a service_role aqui (apenas no backend / edge functions)
//
// Uso:
//   import { supabase } from "@/integrations/supabase/client";
//
// Tipagem de Database vem de: src/integrations/supabase/types.ts
// Gere novamente quando alterar o schema (npx supabase gen types ...)
// =======================================================
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vprfxnvwxlsfxccbhskq.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcmZ4bnZ3eGxzZnhjY2Joc2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NjgwNDgsImV4cCI6MjA2ODQ0NDA0OH0._0EHvzLfWmxSVKdsGu41-ydQu9Ej4TKX1nseHYaTosA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true
  }
});

// Helper opcional para pegar usuário logado (sem lançar erro)
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
