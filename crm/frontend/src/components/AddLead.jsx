import { useState } from "react";
import { leadsAPI } from "../api";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const SOURCE_OPTIONS = ["Website", "LinkedIn", "Referral", "Email", "Other"];
const STATUS_OPTIONS = ["New", "Contacted", "Converted", "Lost"];

const empty = { name: "", email: "", phone: "", source: "Website", status: "New", notes: "", follow_up_date: "" };

export default function AddLead({ onAdded, showToast }) {
  const [fields,  setFields]  = useState({ ...empty });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!fields.name.trim())  e.name  = "Name is required";
    if (!fields.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e.email = "Invalid email";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await leadsAPI.create(fields);
      onAdded(res.data);
      showToast("Lead added successfully! ✅", "success");
      setFields({ ...empty });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add lead", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>Add New Lead</h2>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.25rem" }}>
            Fill in the details below to add a new lead to the CRM.
          </p>
        </div>

        <div className="table-card">
          <form onSubmit={handleSubmit}>
            <div style={{ padding: "1.5rem" }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input className="form-input" type="text" name="name"
                    value={fields.name} onChange={handleChange} placeholder="John Doe"
                    style={{ borderColor: errors.name ? "var(--danger)" : "" }} />
                  {errors.name && <span style={{ fontSize: "0.72rem", color: "var(--danger)" }}>{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input className="form-input" type="email" name="email"
                    value={fields.email} onChange={handleChange} placeholder="john@example.com"
                    style={{ borderColor: errors.email ? "var(--danger)" : "" }} />
                  {errors.email && <span style={{ fontSize: "0.72rem", color: "var(--danger)" }}>{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="US"
                    value={fields.phone}
                    onChange={(phone) => setFields({ ...fields, phone: phone || "" })}
                    placeholder="Enter phone number"
                    className="phone-input-wrapper"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Follow-up Date</label>
                  <input className="form-input" type="date" name="follow_up_date"
                    value={fields.follow_up_date} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Lead Source</label>
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
                    value={fields.notes} onChange={handleChange}
                    placeholder="Any notes or follow-up details about this lead..." rows={4} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setFields({ ...empty })}>
                Clear
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Adding..." : "+ Add Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
