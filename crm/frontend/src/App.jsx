import { useState, useEffect } from "react";
import "./styles/global.css";
import { authAPI } from "./api";
import Login     from "./components/Login";
import Sidebar   from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import LeadTable from "./components/LeadTable";
import AddLead   from "./components/AddLead";

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.message}
    </div>
  );
}

export default function App() {
  const [admin,      setAdmin]     = useState(null);
  const [checking,   setChecking]  = useState(true);
  const [activeTab,  setActiveTab] = useState("dashboard");
  const [refresh,    setRefresh]   = useState(0);
  const [toast,      setToast]     = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    if (!token) { setChecking(false); return; }
    authAPI.me()
      .then(res => setAdmin(res.data.admin))
      .catch(() => localStorage.removeItem("crm_token"))
      .finally(() => setChecking(false));
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem("crm_token");
    setAdmin(null);
    setActiveTab("dashboard");
    setSidebarOpen(false);
  };

  const handleSidebarSelect = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleLeadAdded = (lead) => {
    setRefresh(r => r + 1);
    setActiveTab("leads");
  };

  const topbarTitles = {
    dashboard: { title: "Dashboard", sub: "Overview of your leads and performance" },
    leads:     { title: "All Leads", sub: "Manage and track your leads" },
    add:       { title: "Add Lead",  sub: "Create a new lead entry" },
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "Inter, sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (!admin) {
    return <Login onLogin={setAdmin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        admin={admin}
        activeTab={activeTab}
        onSelect={handleSidebarSelect}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
      />

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(open => !open)} aria-label="Open navigation menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <div className="topbar-title">{topbarTitles[activeTab]?.title}</div>
            <div className="topbar-sub">{topbarTitles[activeTab]?.sub}</div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary btn-sm" onClick={() => { setActiveTab("add"); setSidebarOpen(false); }}>
              + Add Lead
            </button>
          </div>
        </div>

        {/* Page Content */}
        {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === "leads"     && <LeadTable refresh={refresh} showToast={showToast} />}
        {activeTab === "add"       && <AddLead onAdded={handleLeadAdded} showToast={showToast} />}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
