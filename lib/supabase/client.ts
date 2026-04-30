import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function fetchTimes() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("times").select("*");

  if (error) {
    throw error;
  }

  return data;
}
