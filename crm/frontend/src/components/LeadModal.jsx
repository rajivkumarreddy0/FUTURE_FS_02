import { useState } from "react";
import { leadsAPI } from "../api";

const STATUS_OPTIONS = ["New", "Contacted", "Converted", "Lost"];
const SOURCE_OPTIONS = ["Website", "LinkedIn", "Referral", "Email", "Other"];

const badgeClass = { New: "badge-new", Contacted: "badge-contacted", Converted: "badge-converted", Lost: "badge-lost" };

export default function LeadModal({ lead, onClose, onUpdated, onDeleted }) {
  const [editing, setEditing]   = useState(false);
  const [fields,  setFields]    = useState({ ...lead });
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => setFields({ ...fields, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await leadsAPI.update(lead.id, fields);
      onUpdated(res.data);
      setEditing(false);
    } catch { alert("Failed to update lead."); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await leadsAPI.delete(lead.id);
      onDeleted(lead.id);
      onClose();
    } catch { alert("Failed to delete lead."); }
  };

  const handleStatusChange = async (status) => {
    try {
      await leadsAPI.updateStatus(lead.id, status);
      setFields({ ...fields, status });
      onUpdated({ ...fields, status });
    } catch { alert("Failed to update status."); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{fields.name}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>{fields.email}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {!editing ? (
            <>
              {/* Status quick change */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                  Status
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      style={{
                        padding: "0.3rem 0.75rem", borderRadius: "20px",
                        fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                        border: fields.status === s ? "2px solid currentColor" : "2px solid transparent",
                        transition: "all 0.15s",
                      }}
                      className={`badge ${badgeClass[s]}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="lead-detail">
                {[
                  ["Phone",       fields.phone       || "—"],
                  ["Source",      fields.source      || "—"],
                  ["Follow-up",   fields.follow_up_date || "—"],
                  ["Created",     new Date(fields.created_at).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div className="detail-item" key={label}>
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value}</span>
                  </div>
                ))}
              </div>

              {fields.notes && (
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "1.25rem", marginBottom: "0.5rem" }}>Notes</div>
                  <div className="notes-box">{fields.notes}</div>
                </div>
              )}
            </>
          ) : (
            <div className="form-grid">
              {[
                { label: "Full Name",   name: "name",   type: "text" },
                { label: "Email",       name: "email",  type: "email" },
                { label: "Phone",       name: "phone",  type: "text" },
                { label: "Follow-up Date", name: "follow_up_date", type: "date" },
              ].map(f => (
                <div className="form-group" key={f.name}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} name={f.name}
                    value={fields[f.name] || ""} onChange={handleChange} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-select" name="source" value={fields.source} onChange={handleChange}>
                  {SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={fields.status} onChange={handleChange}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" name="notes"
                  value={fields.notes || ""} onChange={handleChange} rows={4} />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          <div style={{ flex: 1 }} />
          {editing ? (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setFields({ ...lead }); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit Lead</button>
          )}
        </div>
      </div>
    </div>
  );
}
