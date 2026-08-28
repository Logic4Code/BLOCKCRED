require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Ensure data files exist ──────────────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

['reports.json', 'modifications.json'].forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
});

// ─── Initialize blockchain (loads or creates chain.json) ──────────────────────
const { getBlockchain } = require('./blockchain/Blockchain');
const blockchain = getBlockchain();
console.log('\n🔗 BlockCred Chain initialized');
console.log(`   Blocks: ${blockchain.chain.length}`);
console.log(`   Integrity: ${blockchain.isChainValid().valid ? '✅ Valid' : '❌ Compromised'}\n`);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/credentials', require('./routes/credentials'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  const bc = getBlockchain();
  res.json({
    status: 'ok',
    service: 'BlockCred API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    blockchain: bc.getChainSummary()
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BlockCred API running at http://localhost:${PORT}`);
  console.log(`📋 API docs: http://localhost:${PORT}/api/health`);
});
