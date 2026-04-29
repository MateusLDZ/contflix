"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Topbar({
  title,
  onMenu,
}: {
  title: string;
  onMenu: () => void;
}) {
  const [now, setNow] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setNow(
        new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateClock();

    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </button>

        <p className="text-sm text-contflix-muted">
          Principal ›{" "}
          <span className="text-contflix-text font-medium">
            {title}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden md:inline text-sm text-contflix-muted">
          {now}
        </span>

        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>

    </header>
  );
}