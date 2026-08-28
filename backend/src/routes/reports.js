const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const REPORTS_FILE = path.join(__dirname, '../data/reports.json');

function loadReports() {
  return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8'));
}
function saveReports(data) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(data, null, 2));
}

// POST /api/reports — File a tamper/fraud report (employer, public)
router.post('/', (req, res) => {
  try {
    const { credentialId, blockHash, reporterName, reporterEmail, reporterOrganization, reason, details } = req.body;

    if (!reason)
      return res.status(400).json({ error: 'Reason for report is required' });

    if (!credentialId && !blockHash)
      return res.status(400).json({ error: 'Either credentialId or blockHash is required' });

    const reports = loadReports();
    const report = {
      id: uuidv4(),
      credentialId: credentialId || null,
      blockHash: blockHash || null,
      reporterName: reporterName || 'Anonymous',
      reporterEmail: reporterEmail || null,
      reporterOrganization: reporterOrganization || null,
      reason,
      details: details || '',
      status: 'open',
      reportedAt: new Date().toISOString()
    };

    reports.push(report);
    saveReports(reports);

    res.status(201).json({
      message: 'Report filed successfully. Our team will investigate.',
      reportId: report.id,
      status: 'open'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports — Get all reports (institution can see their own creds' reports)
router.get('/', (req, res) => {
  try {
    const reports = loadReports();
    res.json({ reports, total: reports.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
