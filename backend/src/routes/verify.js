const express = require('express');
const router = express.Router();
const { getBlockchain } = require('../blockchain/Blockchain');
const { generateQRCode } = require('../services/qrService');

// GET /api/verify/chain/status — MUST be declared before /:hash
router.get('/chain/status', (req, res) => {
  try {
    const blockchain = getBlockchain();
    const summary = blockchain.getChainSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/verify/:hash — Public verification by block hash
router.get('/:hash', async (req, res) => {
  try {
    const blockchain = getBlockchain();
    const { hash } = req.params;

    // Reload from disk so any external tampering is detected immediately
    blockchain.load();

    // Validate full chain integrity
    const chainValidity = blockchain.isChainValid();

    // Find the block
    const block = blockchain.getBlockByHash(hash);

    if (!block) {
      return res.json({
        status: 'NOT_FOUND',
        message: 'No credential found with this hash.',
        hash,
        verified: false,
        chainIntegrity: chainValidity
      });
    }

    // Must be a CREDENTIAL block
    if (block.data.type !== 'CREDENTIAL') {
      return res.json({
        status: 'NOT_CREDENTIAL',
        message: 'This hash does not correspond to a credential block.',
        hash,
        verified: false
      });
    }

    // Check revocation by scanning chain for a REVOCATION block (never trust mutated .data.status)
    const revocation = blockchain.getRevocationStatus(block.data.credentialId);
    if (revocation) {
      return res.json({
        status: 'REVOKED',
        message: 'This credential has been revoked by the issuing institution.',
        credential: {
          credentialId: block.data.credentialId,
          studentName: block.data.studentName,
          studentId: block.data.studentId,
          course: block.data.course,
          issuerName: block.data.issuerName,
          issuedAt: block.data.issuedAt
        },
        revocationDetails: revocation.data,
        hash,
        blockIndex: block.index,
        verified: false,
        chainIntegrity: chainValidity
      });
    }

    // Check tamper AFTER revocation (revoked chain is still structurally valid)
    if (!chainValidity.valid) {
      return res.json({
        status: 'TAMPERED',
        message: 'BLOCKCHAIN INTEGRITY VIOLATION: The chain has been tampered with. This credential cannot be trusted.',
        hash,
        blockIndex: block.index,
        tamperDetails: chainValidity,
        verified: false
      });
    }

    // ✅ All checks passed — VERIFIED
    const verifyUrl = `http://localhost:5173/verify/${hash}`;
    const qrCode = await generateQRCode(verifyUrl);

    res.json({
      status: 'VERIFIED',
      message: 'Credential is authentic and blockchain-verified.',
      credential: {
        credentialId: block.data.credentialId,
        studentName: block.data.studentName,
        studentId: block.data.studentId,
        course: block.data.course,
        specialization: block.data.specialization,
        grade: block.data.grade,
        cgpa: block.data.cgpa,
        yearOfPassing: block.data.yearOfPassing,
        issuerName: block.data.issuerName,
        issuedAt: block.data.issuedAt,
        version: block.data.version || 1
      },
      blockDetails: {
        index: block.index,
        hash: block.hash,
        previousHash: block.previousHash,
        timestamp: block.timestamp,
        nonce: block.nonce
      },
      chainIntegrity: chainValidity,
      qrCode,
      verifyUrl,
      verified: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/verify/by-id — Verify by credential ID
router.post('/by-id', async (req, res) => {
  try {
    const { credentialId } = req.body;
    if (!credentialId)
      return res.status(400).json({ error: 'credentialId required' });

    const blockchain = getBlockchain();
    blockchain.load();
    const block = blockchain.getBlockByCredentialId(credentialId);

    if (!block) {
      return res.json({ status: 'NOT_FOUND', message: 'No credential found with this ID.', verified: false });
    }

    // Validate full chain integrity
    const chainValidity = blockchain.isChainValid();

    // Check revocation
    const revocation = blockchain.getRevocationStatus(credentialId);
    if (revocation) {
      return res.json({
        status: 'REVOKED',
        message: 'This credential has been revoked by the issuing institution.',
        credential: {
          credentialId: block.data.credentialId,
          studentName: block.data.studentName,
          studentId: block.data.studentId,
          course: block.data.course,
          issuerName: block.data.issuerName,
          issuedAt: block.data.issuedAt
        },
        revocationDetails: revocation.data,
        hash: block.hash,
        blockIndex: block.index,
        verified: false,
        chainIntegrity: chainValidity
      });
    }

    // Check tamper
    if (!chainValidity.valid) {
      return res.json({
        status: 'TAMPERED',
        message: 'BLOCKCHAIN INTEGRITY VIOLATION: The chain has been tampered with.',
        hash: block.hash,
        blockIndex: block.index,
        tamperDetails: chainValidity,
        verified: false
      });
    }

    // ✅ VERIFIED
    const verifyUrl = `http://localhost:5173/verify/${block.hash}`;
    const qrCode = await generateQRCode(verifyUrl);

    res.json({
      status: 'VERIFIED',
      message: 'Credential is authentic and blockchain-verified.',
      credential: {
        credentialId: block.data.credentialId,
        studentName: block.data.studentName,
        studentId: block.data.studentId,
        course: block.data.course,
        specialization: block.data.specialization,
        grade: block.data.grade,
        cgpa: block.data.cgpa,
        yearOfPassing: block.data.yearOfPassing,
        issuerName: block.data.issuerName,
        issuedAt: block.data.issuedAt,
        version: block.data.version || 1
      },
      blockDetails: {
        index: block.index,
        hash: block.hash,
        previousHash: block.previousHash,
        timestamp: block.timestamp
      },
      chainIntegrity: chainValidity,
      qrCode,
      verifyUrl,
      verified: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
