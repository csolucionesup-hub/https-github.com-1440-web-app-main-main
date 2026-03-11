import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";
import { QuoteCategory, systemQuotes } from "../../config/systemQuotes";

interface Props {
  strategy?: "random" | "daily";
  category?: QuoteCategory;
}

export default function MotivationalQuote({ strategy = "random", category }: Props) {
  const userQuotes = useAppStore((state) => state.userQuotes);
  
  const pool = useMemo(() => {
    const sys = category ? systemQuotes[category] : Object.values(systemQuotes).flat();
    return [...sys, ...userQuotes.map(q => q.text)];
  }, [userQuotes, category]);

  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (pool.length === 0) return;

    if (strategy === "daily") {
      const now = new Date();
      // Simple day of year calculation for deterministic rotation
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      const index = dayOfYear % pool.length;
      setQuote(pool[index]);
    } else {
      // Random selection for other views
      const randomIndex = Math.floor(Math.random() * pool.length);
      setQuote(pool[randomIndex]);
    }
  }, [pool, strategy]);

  if (!quote) return null;

  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: 14,
        background: "rgba(79,70,229,0.06)",
        border: "1px solid rgba(79,70,229,0.12)",
        color: "#E2E8F0",
        fontSize: 14,
        fontStyle: "italic",
        lineHeight: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 12,
        maxWidth: 600
      }}
    >
      <span style={{ fontSize: 20, color: "#4F46E5", lineHeight: 1 }}>“</span>
      <span>{quote}</span>
      <span style={{ fontSize: 20, color: "#4F46E5", lineHeight: 1, alignSelf: "flex-end" }}>”</span>
    </div>
  );
}
