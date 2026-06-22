import { useState, useEffect, useCallback } from "react";
import { leadsAPI } from "../api";
import LeadModal from "./LeadModal";

const badgeClass = { New: "badge-new", Contacted: "badge-contacted", Converted: "badge-converted", Lost: "badge-lost" };
const STATUS_OPTIONS = ["", "New", "Contacted", "Converted", "Lost"];
const SOURCE_OPTIONS = ["", "Website", "LinkedIn", "Referral", "Email", "Other"];

export default function LeadTable({ refresh, showToast }) {
  const [leads,      setLeads]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [filters,    setFilters]    = useState({ status: "", source: "", search: "" });
  const [page,       setPage]       = useState(1);
  const PER_PAGE = 10;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;
      if (filters.search) params.search = filters.search;
      const res = await leadsAPI.getAll(params);
      setLeads(res.data);
    } catch {
      showToast("Failed to fetch leads", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, refresh]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleUpdated = (updated) =>
    setLeads(leads.map(l => l.id === updated.id ? updated : l));

  const handleDeleted = (id) => {
    setLeads(leads.filter(l => l.id !== id));
    showToast("Lead deleted", "success");
  };

  const paginated = leads.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(leads.length / PER_PAGE);

  return (
    <div className="page">
      <div className="table-card">
        {/* Header */}
        <div className="table-card-header">
          <div>
            <div className="table-card-title">All Leads</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
              {leads.length} total leads
            </div>
          </div>
          <div className="filters">
            <input
              className="search-input"
              placeholder="🔍 Search name, email..."
              value={filters.search}
              onChange={e => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
            />
            <select className="filter-select" value={filters.status}
              onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || "All Status"}</option>)}
            </select>
            <select className="filter-select" value={filters.source}
              onChange={e => { setFilters({ ...filters, source: e.target.value }); setPage(1); }}>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s || "All Sources"}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>Loading leads...</div>
          ) : paginated.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No leads found</h3>
              <p>Try adjusting your filters or add a new lead.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((lead, i) => (
                  <tr key={lead.id}>
                    <td style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                      {(page - 1) * PER_PAGE + i + 1}
                    </td>
                    <td>
                      <div className="td-name">{lead.name}</div>
                      <div className="td-email">{lead.email}</div>
                    </td>
                    <td><span className="source-badge">{lead.source}</span></td>
                    <td>
                      <span className={`badge ${badgeClass[lead.status]}`}>
                        ● {lead.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                      {lead.follow_up_date
                        ? new Date(lead.follow_up_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(lead)}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <LeadModal
          lead={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
