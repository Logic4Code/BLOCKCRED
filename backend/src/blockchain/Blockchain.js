const fs = require('fs');
const path = require('path');
const Block = require('./Block');

const CHAIN_FILE = path.join(__dirname, '../data/chain.json');

class Blockchain {
  constructor() {
    this.chain = [];
    this.load();
    if (this.chain.length === 0) {
      this.chain = [this.createGenesisBlock()];
      this.save();
    }
  }

  createGenesisBlock() {
    const genesis = new Block(0, new Date().toISOString(), {
      type: 'GENESIS',
      message: 'BlockCred Chain — Genesis Block',
      system: 'Blockchain Credential Verification System v1.0'
    }, '0');
    return genesis;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      data,
      this.getLatestBlock().hash
    );
    newBlock.mineBlock(2);
    this.chain.push(newBlock);
    this.save();
    return newBlock;
  }

  isChainValid() {
    // Always reload from disk to catch any manual or external tampering
    this.load();
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Recompute hash to check integrity
      const recomputed = this._recomputeHash(currentBlock);
      if (currentBlock.hash !== recomputed) {
        return { valid: false, brokenAt: i, reason: 'Hash mismatch at block ' + i };
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return { valid: false, brokenAt: i, reason: 'Chain link broken at block ' + i };
      }
    }
    return { valid: true };
  }

  _recomputeHash(block) {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(
        block.index +
        block.timestamp +
        JSON.stringify(block.data) +
        block.previousHash +
        block.nonce
      )
      .digest('hex');
  }

  getBlockByHash(hash) {
    return this.chain.find(b => b.hash === hash) || null;
  }

  getBlockByCredentialId(credentialId) {
    return this.chain.find(
      b => b.data && b.data.credentialId === credentialId
    ) || null;
  }

  getCredentialsByStudentId(studentId) {
    return this.chain.filter(
      b => b.data && b.data.studentId === studentId && b.data.type === 'CREDENTIAL'
    );
  }

  getCredentialsByInstitution(institutionId) {
    return this.chain.filter(
      b => b.data && b.data.issuerId === institutionId && b.data.type === 'CREDENTIAL'
    );
  }

  revokeCredential(credentialId, reason, revokedBy) {
    // Add a revocation block (doesn't modify original — chain stays intact)
    const original = this.getBlockByCredentialId(credentialId);
    if (!original) return null;

    const revocationBlock = this.addBlock({
      type: 'REVOCATION',
      credentialId,
      reason,
      revokedBy,
      originalHash: original.hash,
      revokedAt: new Date().toISOString()
    });

    // DO NOT mutate original block.data — that would break its hash.
    // Revocation status is determined by scanning for a REVOCATION block in the chain.
    return revocationBlock;
  }

  getRevocationStatus(credentialId) {
    return this.chain.find(
      b => b.data && b.data.type === 'REVOCATION' && b.data.credentialId === credentialId
    ) || null;
  }

  getAllCredentials() {
    return this.chain.filter(b => b.data && b.data.type === 'CREDENTIAL');
  }

  save() {
    fs.writeFileSync(CHAIN_FILE, JSON.stringify(this.chain, null, 2));
  }

  load() {
    try {
      if (fs.existsSync(CHAIN_FILE)) {
        const raw = fs.readFileSync(CHAIN_FILE, 'utf-8');
        this.chain = JSON.parse(raw);
      }
    } catch (e) {
      this.chain = [];
    }
  }

  getChainSummary() {
    const validity = this.isChainValid();
    return {
      totalBlocks: this.chain.length,
      credentials: this.chain.filter(b => b.data && b.data.type === 'CREDENTIAL').length,
      revocations: this.chain.filter(b => b.data && b.data.type === 'REVOCATION').length,
      isValid: validity.valid,
      validityDetail: validity,
      latestHash: this.getLatestBlock().hash
    };
  }
}

// Singleton
let instance = null;
function getBlockchain() {
  if (!instance) instance = new Blockchain();
  return instance;
}

module.exports = { Blockchain, getBlockchain };
