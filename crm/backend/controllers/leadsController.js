const { pool } = require("../config/db");

// GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { status, source, search } = req.query;
    let query = "SELECT * FROM leads WHERE 1=1";
    const params = [];

    if (status)  { query += " AND status = ?";  params.push(status); }
    if (source)  { query += " AND source = ?";  params.push(source); }
    if (search)  {
      query += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM leads WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Lead not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/leads
exports.createLead = async (req, res) => {
  const { name, email, phone, source, status, notes, follow_up_date } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Name and email required" });

  try {
    const [result] = await pool.query(
      `INSERT INTO leads (name, email, phone, source, status, notes, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, source || "Website",
       status || "New", notes || null, follow_up_date || null]
    );
    const [newLead] = await pool.query("SELECT * FROM leads WHERE id = ?", [result.insertId]);
    res.status(201).json(newLead[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  const { name, email, phone, source, status, notes, follow_up_date } = req.body;
  try {
    await pool.query(
      `UPDATE leads SET name=?, email=?, phone=?, source=?, status=?, notes=?, follow_up_date=?
       WHERE id=?`,
      [name, email, phone || null, source, status, notes || null,
       follow_up_date || null, req.params.id]
    );
    const [updated] = await pool.query("SELECT * FROM leads WHERE id = ?", [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /api/leads/:id/status
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["New", "Contacted", "Converted", "Lost"];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: "Invalid status" });

  try {
    await pool.query("UPDATE leads SET status=? WHERE id=?", [status, req.params.id]);
    res.json({ message: "Status updated", status });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    await pool.query("DELETE FROM leads WHERE id = ?", [req.params.id]);
    res.json({ message: "Lead deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/leads/stats
exports.getStats = async (req, res) => {
  try {
    const [total]     = await pool.query("SELECT COUNT(*) as count FROM leads");
    const [newL]      = await pool.query("SELECT COUNT(*) as count FROM leads WHERE status='New'");
    const [contacted] = await pool.query("SELECT COUNT(*) as count FROM leads WHERE status='Contacted'");
    const [converted] = await pool.query("SELECT COUNT(*) as count FROM leads WHERE status='Converted'");
    const [lost]      = await pool.query("SELECT COUNT(*) as count FROM leads WHERE status='Lost'");

    res.json({
      total:     total[0].count,
      new:       newL[0].count,
      contacted: contacted[0].count,
      converted: converted[0].count,
      lost:      lost[0].count,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
