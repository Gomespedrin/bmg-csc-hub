// src/supabase.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Lê as variáveis definidas em .env (Vite exige prefixo VITE_)
 * Certifique-se de ter no arquivo .env:
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidas.");
  throw new Error("Config Supabase ausente");
}

/**
 * Exporta o client único (singleton) usado em todo o app.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
