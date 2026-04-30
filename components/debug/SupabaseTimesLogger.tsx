"use client";

import { useEffect } from "react";
import { fetchTimes } from "@/lib/supabase/client";

export function SupabaseTimesLogger() {
  useEffect(() => {
    const loadTimes = async () => {
      try {
        const times = await fetchTimes();
        console.log("Times carregados do Supabase:", times);
      } catch (error) {
        console.error("Falha ao carregar times do Supabase:", error);
      }
    };

    loadTimes();
  }, []);

  return null;
}
