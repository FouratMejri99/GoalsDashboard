import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Missing config is a setup problem, not a runtime one — fail loudly in the
// console rather than letting every Supabase call throw a cryptic error.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase is not configured. Copy .env.example to .env.local and fill in " +
      "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from your Supabase project settings."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
