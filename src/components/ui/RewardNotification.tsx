import React, { useEffect, useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Star, Award, Trophy } from "lucide-react";

export default function RewardNotification() {
  const reward = useAppStore((state) => state.rewardNotification);
  const clearReward = useAppStore((state) => state.clearReward);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (reward) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(clearReward, 300); // Wait for fade out
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [reward, clearReward]);

  if (!reward && !isVisible) return null;

  const icons = {
    star: <Star size={20} fill="#EAB308" color="#EAB308" />,
    medal: <Award size={20} fill="#94A3B8" color="#94A3B8" />,
    trophy: <Trophy size={20} fill="#F59E0B" color="#F59E0B" />,
  };

  const colors = {
    star: "#EAB308",
    medal: "#3B82F6",
    trophy: "#F59E0B",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        transform: isVisible ? "translateY(0)" : "translateY(100px)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        background: "#1E293B",
        border: `1px solid ${colors[reward?.type || "star"]}44`,
        borderRadius: 16,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `${colors[reward?.type || "star"]}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icons[reward?.type || "star"]}
      </div>
      <div>
        <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          ¡Logro Desbloqueado!
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC" }}>
          {reward?.title}
        </div>
      </div>
    </div>
  );
}
