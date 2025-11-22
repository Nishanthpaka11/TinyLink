import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

export default function HealthBadge() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${API_BASE}/healthz`);
        if (!res.ok) {
          setStatus("bad");
          return;
        }
        const json = await res.json();

        if (json.ok === true) {
          setStatus("good");
        } else {
          setStatus("bad");
        }
      } catch (e) {
        setStatus("bad");
      }
    }

    checkHealth();

    // Re-check every 15 seconds
    const interval = setInterval(checkHealth, 15000);

    return () => clearInterval(interval);
  }, []);

  let color = "#666";
  let text = "Loading…";

  if (status === "good") {
    color = "#22c55e"; // green
    text = "Healthy";
  } else if (status === "bad") {
    color = "#ef4444"; // red
    text = "Offline";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(255,255,255,0.05)",
        padding: "6px 12px",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: color,
        }}
      ></div>
      <span style={{ fontSize: "0.85rem", color: "#eee" }}>{text}</span>
    </div>
  );
}
