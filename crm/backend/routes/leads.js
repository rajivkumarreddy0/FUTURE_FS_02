const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getLeads, getLead, createLead,
  updateLead, updateStatus, deleteLead, getStats
} = require("../controllers/leadsController");

router.get("/stats", auth, getStats);
router.get("/",      auth, getLeads);
router.get("/:id",   auth, getLead);
router.post("/",     auth, createLead);
router.put("/:id",   auth, updateLead);
router.patch("/:id/status", auth, updateStatus);
router.delete("/:id", auth, deleteLead);

module.exports = router;
