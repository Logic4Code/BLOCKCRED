const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { getBlockchain } = require('../blockchain/Blockchain');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { generateQRCode } = require('../services/qrService');
const { generateCredentialPDF } = require('../services/pdfService');
const { sendCredentialEmail } = require('../services/emailService');

const MODIFICATIONS_FILE = path.join(__dirname, '../data/modifications.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

function loadModifications() {
  return JSON.parse(fs.readFileSync(MODIFICATIONS_FILE, 'utf-8'));
}
function saveModifications(data) {
  fs.writeFileSync(MODIFICATIONS_FILE, JSON.stringify(data, null, 2));
}
function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

// ─── INSTITUTION ROUTES ──────────────────────────────────────────────────────

// POST /api/credentials/issue — Issue a new credential
router.post('/issue', authMiddleware, requireRole('institution'), async (req, res) => {
  try {
    const {
      studentName, studentId, studentEmail,
      course, specialization, grade, cgpa,
      yearOfPassing, duration, additionalInfo
    } = req.body;

    if (!studentName || !studentId || !studentEmail || !course || !grade)
      return res.status(400).json({ error: 'Missing required fields' });

    const blockchain = getBlockchain();
    const credentialId = 'CRED-' + uuidv4().split('-')[0].toUpperCase();

    const credentialData = {
      type: 'CREDENTIAL',
      credentialId,
      studentName,
      studentId,
      studentEmail,
      course,
      specialization: specialization || '',
      grade,
      cgpa: cgpa || '',
      yearOfPassing: yearOfPassing || new Date().getFullYear().toString(),
      duration: duration || '',
      additionalInfo: additionalInfo || '',
      issuerId: req.user.id,
      issuerName: req.user.name,
      issuedAt: new Date().toISOString(),
      status: 'active',
      version: 1
    };

    const block = blockchain.addBlock(credentialData);
    const verifyUrl = `http://localhost:5173/verify/${block.hash}`;

    // Generate QR
    const qrDataURL = await generateQRCode(verifyUrl);

    // Generate PDF
    const pdfBuffer = await generateCredentialPDF(
      { ...credentialData, blockHash: block.hash, blockIndex: block.index },
      verifyUrl
    );

    // Send email to student (async, don't block response)
    sendCredentialEmail({
      to: studentEmail,
      studentName,
      credentialId,
      blockHash: block.hash,
      qrDataURL,
      pdfBuffer,
      verifyUrl,
      issuerName: req.user.name,
      course
    }).catch(err => console.error('Email send failed:', err.message));

    res.status(201).json({
      message: 'Credential issued successfully',
      credentialId,
      blockIndex: block.index,
      blockHash: block.hash,
      qrCode: qrDataURL,
      verifyUrl,
      issuedAt: block.timestamp
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/credentials/issued — Get all credentials issued by this institution
router.get('/issued', authMiddleware, requireRole('institution'), (req, res) => {
  try {
    const blockchain = getBlockchain();
    const credentials = blockchain.getCredentialsByInstitution(req.user.id);
    res.json({ credentials, total: credentials.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/credentials/chain — Full blockchain (institution/admin)
router.get('/chain', authMiddleware, requireRole('institution'), (req, res) => {
  try {
    const blockchain = getBlockchain();
    const summary = blockchain.getChainSummary();
    res.json({ chain: blockchain.chain, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credentials/revoke/:credentialId
router.post('/revoke/:credentialId', authMiddleware, requireRole('institution'), (req, res) => {
  try {
    const { credentialId } = req.params;
    const { reason } = req.body;

    if (!reason)
      return res.status(400).json({ error: 'Revocation reason required' });

    const blockchain = getBlockchain();
    const original = blockchain.getBlockByCredentialId(credentialId);

    if (!original)
      return res.status(404).json({ error: 'Credential not found' });

    if (original.data.issuerId !== req.user.id)
      return res.status(403).json({ error: 'You can only revoke your own credentials' });

    if (original.data.status === 'revoked')
      return res.status(400).json({ error: 'Credential already revoked' });

    const revBlock = blockchain.revokeCredential(credentialId, reason, req.user.id);
    res.json({
      message: 'Credential revoked successfully',
      credentialId,
      revocationBlockHash: revBlock.hash,
      reason,
      revokedAt: revBlock.timestamp
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/credentials/modifications — Get modification requests for this institution
router.get('/modifications', authMiddleware, requireRole('institution'), (req, res) => {
  try {
    const mods = loadModifications().filter(m => m.institutionId === req.user.id);
    res.json({ modifications: mods });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credentials/modifications/:id/approve — Approve modification and re-issue
router.post('/modifications/:id/approve', authMiddleware, requireRole('institution'), async (req, res) => {
  try {
    const mods = loadModifications();
    const modIdx = mods.findIndex(m => m.id === req.params.id && m.institutionId === req.user.id);
    if (modIdx === -1)
      return res.status(404).json({ error: 'Modification request not found' });

    const mod = mods[modIdx];
    if (mod.status !== 'pending')
      return res.status(400).json({ error: 'Request already processed' });

    const blockchain = getBlockchain();
    const original = blockchain.getBlockByCredentialId(mod.credentialId);
    if (!original) return res.status(404).json({ error: 'Original credential not found' });

    // Build updated credential data
    const updatedData = {
      ...original.data,
      ...mod.requestedChanges,
      credentialId: 'CRED-' + uuidv4().split('-')[0].toUpperCase(), // new ID
      originalCredentialId: mod.credentialId,
      issuedAt: new Date().toISOString(),
      status: 'active',
      version: (original.data.version || 1) + 1,
      modificationNote: mod.reason
    };

    // Mark original as superseded
    original.data.status = 'superseded';
    original.data.supersededBy = updatedData.credentialId;
    blockchain.save();

    const newBlock = blockchain.addBlock(updatedData);
    const verifyUrl = `http://localhost:5173/verify/${newBlock.hash}`;
    const qrDataURL = await generateQRCode(verifyUrl);

    const pdfBuffer = await generateCredentialPDF(
      { ...updatedData, blockHash: newBlock.hash, blockIndex: newBlock.index },
      verifyUrl
    );

    // Send update email
    const { sendModificationEmail } = require('../services/emailService');
    sendModificationEmail({
      to: original.data.studentEmail,
      studentName: updatedData.studentName,
      credentialId: updatedData.credentialId,
      newHash: newBlock.hash,
      verifyUrl,
      changes: mod.reason
    }).catch(err => console.error('Modification email failed:', err.message));

    mods[modIdx].status = 'approved';
    mods[modIdx].processedAt = new Date().toISOString();
    mods[modIdx].newCredentialId = updatedData.credentialId;
    mods[modIdx].newBlockHash = newBlock.hash;
    saveModifications(mods);

    res.json({
      message: 'Modification approved, new credential issued',
      newCredentialId: updatedData.credentialId,
      newBlockHash: newBlock.hash,
      newQrCode: qrDataURL,
      verifyUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credentials/modifications/:id/reject
router.post('/modifications/:id/reject', authMiddleware, requireRole('institution'), (req, res) => {
  try {
    const mods = loadModifications();
    const modIdx = mods.findIndex(m => m.id === req.params.id && m.institutionId === req.user.id);
    if (modIdx === -1) return res.status(404).json({ error: 'Not found' });
    mods[modIdx].status = 'rejected';
    mods[modIdx].processedAt = new Date().toISOString();
    mods[modIdx].rejectReason = req.body.reason || 'Rejected by institution';
    saveModifications(mods);
    res.json({ message: 'Modification request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STUDENT ROUTES ───────────────────────────────────────────────────────────

// GET /api/credentials/my — Student's own credentials
router.get('/my', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const blockchain = getBlockchain();
    const credentials = blockchain.getCredentialsByStudentId(req.user.studentId);

    const enriched = await Promise.all(credentials.map(async (block) => {
      const verifyUrl = `http://localhost:5173/verify/${block.hash}`;
      const qrCode = await generateQRCode(verifyUrl);
      return { ...block, qrCode, verifyUrl };
    }));

    res.json({ credentials: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credentials/request-modification — Student requests a change
router.post('/request-modification', authMiddleware, requireRole('student'), (req, res) => {
  try {
    const { credentialId, reason, requestedChanges } = req.body;
    if (!credentialId || !reason)
      return res.status(400).json({ error: 'Credential ID and reason required' });

    const blockchain = getBlockchain();
    const original = blockchain.getBlockByCredentialId(credentialId);
    if (!original) return res.status(404).json({ error: 'Credential not found' });

    // Verify the student owns this credential
    if (original.data.studentId !== req.user.studentId)
      return res.status(403).json({ error: 'This credential does not belong to you' });

    const mods = loadModifications();
    const existing = mods.find(m => m.credentialId === credentialId && m.status === 'pending');
    if (existing)
      return res.status(400).json({ error: 'A modification request is already pending for this credential' });

    const modRequest = {
      id: uuidv4(),
      credentialId,
      studentId: req.user.studentId,
      studentName: original.data.studentName,
      studentEmail: original.data.studentEmail,
      institutionId: original.data.issuerId,
      reason,
      requestedChanges: requestedChanges || {},
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    mods.push(modRequest);
    saveModifications(mods);

    res.status(201).json({
      message: 'Modification request submitted successfully',
      requestId: modRequest.id,
      status: 'pending'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/credentials/my-modifications — Student's modification request history
router.get('/my-modifications', authMiddleware, requireRole('student'), (req, res) => {
  try {
    const mods = loadModifications().filter(m => m.studentId === req.user.studentId);
    res.json({ modifications: mods });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/credentials/:credentialId/qr — Get QR for a specific credential
router.get('/:credentialId/qr', authMiddleware, async (req, res) => {
  try {
    const blockchain = getBlockchain();
    const block = blockchain.getBlockByCredentialId(req.params.credentialId);
    if (!block) return res.status(404).json({ error: 'Credential not found' });

    const verifyUrl = `http://localhost:5173/verify/${block.hash}`;
    const qrCode = await generateQRCode(verifyUrl);
    res.json({ qrCode, verifyUrl, hash: block.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/credentials/:credentialId/pdf — Download PDF
router.get('/:credentialId/pdf', async (req, res) => {
  try {
    const blockchain = getBlockchain();
    const block = blockchain.getBlockByCredentialId(req.params.credentialId);
    if (!block) return res.status(404).json({ error: 'Credential not found' });

    const verifyUrl = `http://localhost:5173/verify/${block.hash}`;
    const pdfBuffer = await generateCredentialPDF(
      { ...block.data, blockHash: block.hash, blockIndex: block.index },
      verifyUrl
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=credential_${block.data.credentialId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
