import { useState, useEffect } from "react";
import { leadsAPI } from "../api";

const statCards = [
  { key: "total",     label: "Total Leads",     color: "#6366f1", bg: "#eef2ff", icon: "👥" },
  { key: "new",       label: "New Leads",        color: "#3b82f6", bg: "#dbeafe", icon: "🆕" },
  { key: "contacted", label: "Contacted",        color: "#f59e0b", bg: "#fef3c7", icon: "📞" },
  { key: "converted", label: "Converted",        color: "#10b981", bg: "#d1fae5", icon: "✅" },
];

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0, lost: 0 });

  useEffect(() => {
    leadsAPI.getStats().then(res => setStats(res.data)).catch(() => {});
  }, []);

  const conversionRate = stats.total > 0
    ? ((stats.converted / stats.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="page">
      {/* Stats */}
      <div className="stats-grid">
        {statCards.map(card => (
          <div className="stat-card" key={card.key}>
            <div className="stat-card-top">
              <div>
                <div className="stat-card-num">{stats[card.key]}</div>
                <div className="stat-card-label">{card.label}</div>
              </div>
              <div className="stat-card-icon" style={{ background: card.bg, color: card.color, fontSize: "1.3rem" }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>

        {/* Conversion Rate */}
        <div className="table-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
            Conversion Rate
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--success)" }}>
            {conversionRate}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>
            {stats.converted} out of {stats.total} leads converted
          </div>
          <div style={{ marginTop: "1rem", background: "var(--surface2)", borderRadius: "20px", height: "8px", overflow: "hidden" }}>
            <div style={{ width: `${conversionRate}%`, background: "var(--success)", height: "100%", borderRadius: "20px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Lost Leads */}
        <div className="table-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
            Pipeline Overview
          </div>
          {[
            { label: "New",       count: stats.new,       color: "#3b82f6" },
            { label: "Contacted", count: stats.contacted, color: "#f59e0b" },
            { label: "Converted", count: stats.converted, color: "#10b981" },
            { label: "Lost",      count: stats.lost,      color: "#ef4444" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                <span style={{ fontSize: "0.82rem", color: "var(--text)" }}>{item.label}</span>
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: item.color }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="table-card" style={{ padding: "1.5rem" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
          Quick Actions
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => setActiveTab("add")}>
            + Add New Lead
          </button>
          <button className="btn btn-outline" onClick={() => setActiveTab("leads")}>
            📋 View All Leads
          </button>
        </div>
      </div>
    </div>
  );
}
