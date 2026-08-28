# 🔗 BlockCred — Blockchain-Backed Academic Credential Verification System

> **Tamper-Proof · Instant Verification · SHA-256 Hash-Chain · Cyberpunk UI**

BlockCred solves the problem of fake degrees and slow manual verification by issuing digitally-signed, blockchain-secured academic credentials. Employers and verifiers can instantly validate authenticity via QR code or credential ID — without ever contacting the issuing institution.

---

## 🚀 How to Run

### Prerequisites
- **Node.js** v18 or above → [Download](https://nodejs.org)
- **npm** (comes with Node.js)

### Step 1 — Clone / Extract the project
```
blockcred/
├── backend/
└── frontend/
```

### Step 2 — Start the Backend
Open a terminal in the `blockcred` folder:
```bash
cd backend
npm install
npm start
```
> Backend runs at **http://localhost:5000**  
> You will see: `🚀 BlockCred API running at http://localhost:5000`

### Step 3 — Start the Frontend
Open a **second terminal**:
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at **http://localhost:5173**

### Step 4 — Open in Browser
```
http://localhost:5173
```

---

## 🔐 Demo Login Accounts

> **Password for ALL accounts: `password`**

| Role | Name | Email |
|------|------|-------|
| 🏛️ Institution | NIT Rourkela | `registrar@nitrkl.ac.in` |
| 🏛️ Institution | NIT Trichy | `registrar@nitt.edu` |
| 🎓 Student | Arjun Sharma | `arjun.sharma@student.nitrkl.ac.in` |
| 🎓 Student | Priya Menon | `priya.menon@student.nitt.edu` |
| 🏢 Employer | TechCorp India | `hr@techcorp.in` |
| 🏢 Employer | UPSC | `verify@upsc.gov.in` |

> 💡 On the Login page, click the **Institution / Student / Employer** quick-fill buttons to auto-fill credentials.

---

## ✨ Features

### 🏛️ Institution Portal
| Feature | Description |
|---------|-------------|
| **Issue Credentials** | Fill student details (name, ID, course, grade, CGPA, year) and submit. A blockchain block is mined instantly. |
| **QR Code Generation** | Every credential automatically gets a unique neon-styled QR code linking to its verification page. |
| **PDF Certificate** | A cyberpunk-styled A4 landscape PDF is auto-generated with all credential details and the QR code embedded. |
| **Email Delivery** | Credential PDF + QR code is emailed to the student automatically on issue. |
| **Dashboard** | View all issued credentials in a table with status, grade, and inline revocation. |
| **Revoke Credentials** | Instantly revoke a credential with a reason. A REVOCATION block is added to the chain — the original block is never deleted. |
| **Blockchain Explorer** | Visual block-by-block view of the entire chain with hashes, previous hashes, timestamps, and nonces. |
| **Chain Integrity Banner** | Real-time banner showing if the chain is VALID or COMPROMISED. |

### 🎓 Student Portal
| Feature | Description |
|---------|-------------|
| **View Credentials** | See all credentials issued by the institution with full details. |
| **QR Code Display** | QR code shown on each credential card for instant sharing. |
| **Download PDF** | Download the blockchain-signed PDF certificate directly. |
| **Copy Hash** | One-click copy of the SHA-256 blockchain hash for sharing with employers. |
| **Verify Online** | Direct link to the public verification page for each credential. |
| **Status Tracking** | View credential status — Active, Revoked, or Superseded. |

### 🏢 Employer / Verifier Portal *(No login required — public access)*
| Feature | Description |
|---------|-------------|
| **Hash Lookup** | Paste the 64-character SHA-256 hash or credential ID to verify instantly. |
| **QR Code Upload** | Upload a QR code image — the system decodes it and verifies automatically. |
| **VERIFIED Result** | Shows full credential details + green ✓ Verified badge. |
| **TAMPERED Alert** | Red pulsing warning if ANY field in the blockchain has been altered. |
| **REVOKED Status** | Orange warning with revocation reason and date. |
| **Report Fraud** | Submit a fraud report with your name, organization, and reason — logged for audit. |

### 🌐 Public Verify Page
- Reached automatically when scanning a QR code
- Shows full VERIFIED / TAMPERED / REVOKED / NOT FOUND result
- No login needed — anyone can verify

---

## ⛓️ How the Blockchain Works

Each credential is stored as a **block** in a SHA-256 hash-chain:

```
Block #0 (GENESIS)
  hash: "d899f533688c..."
       ↕ linked
Block #1 (CREDENTIAL)
  data: { studentName, course, grade, ... }
  previousHash: "d899f533688c..."
  hash: "00923948dd96..." ← SHA256(index + timestamp + data + previousHash + nonce)
       ↕ linked
Block #2 (REVOCATION)
  data: { credentialId, reason, revokedAt }
  previousHash: "00923948dd96..."
  hash: "0067f97f6779..."
```

**Tamper detection:** Changing ANY character in any block's data produces a completely different hash. The `previousHash` in the next block no longer matches → **chain invalid → TAMPERED**.

**Revocation:** A separate REVOCATION block is added — original blocks are never deleted or modified, preserving the full audit trail.

**Proof of Work:** Each block is mined with difficulty 2 (hash must start with `00`) — simulating real blockchain mining.

---

## 🎯 Demo: How to Show Tampering

1. **Issue a credential** → copy the hash
2. Open `backend/src/data/chain.json` in any text editor
3. Find the credential block → change any field, e.g.:
   ```json
   "grade": "A+"  →  "grade": "A"
   ```
4. Save the file
5. Go to **Employer Portal** → paste the hash → **⚠ TAMPERED**
6. Restore the original value → paste again → **✓ VERIFIED**

---

## 💡 Key Advantages

| Advantage | Details |
|-----------|---------|
| **Instant Verification** | No need to call or email the institution — verify in under 1 second |
| **Tamper-Proof** | SHA-256 cryptographic hashing makes any modification immediately detectable |
| **Immutable Audit Trail** | Revocations add new blocks — nothing is ever deleted from the chain |
| **No Central Authority** | Employers verify directly against the blockchain — no middleman |
| **QR Code Sharing** | Students share credentials via QR code — verifiable offline or online |
| **PDF Certificates** | Professional cyberpunk-styled PDF with embedded QR and blockchain hash |
| **Email Delivery** | Credentials emailed with PDF attachment and QR code on issuance |
| **Fraud Reporting** | Employers can flag suspicious credentials for investigation |
| **Role-Based Access** | Institution, Student, and Employer each have dedicated secure portals |
| **Chain Explorer** | Full transparency — anyone with institution access can see every block |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Blockchain** | Custom SHA-256 hash-chain (single-node, JSON persistence) |
| **Authentication** | JWT (JSON Web Tokens) |
| **QR Code** | `qrcode` npm package |
| **PDF Generation** | `pdfkit` |
| **Email** | Nodemailer + Ethereal (mock SMTP — no real email setup needed) |
| **Styling** | Glassmorphism + Neon cyberpunk dark theme |

---

## 📁 Project Structure

```
blockcred/
├── backend/
│   ├── src/
│   │   ├── blockchain/
│   │   │   ├── Block.js          ← SHA-256 block with proof-of-work mining
│   │   │   └── Blockchain.js     ← Chain management, validation, persistence
│   │   ├── routes/
│   │   │   ├── auth.js           ← Login / JWT
│   │   │   ├── credentials.js    ← Issue, revoke, list credentials
│   │   │   ├── verify.js         ← Public verification (hash / ID)
│   │   │   └── reports.js        ← Fraud report submission
│   │   ├── services/
│   │   │   ├── qrService.js      ← QR code generation
│   │   │   ├── pdfService.js     ← PDF certificate generation
│   │   │   └── emailService.js   ← Email with PDF + QR attachment
│   │   ├── middleware/
│   │   │   └── auth.js           ← JWT verification + role guard
│   │   ├── data/
│   │   │   ├── chain.json        ← Blockchain persisted here (auto-created)
│   │   │   ├── users.json        ← Seed accounts
│   │   │   └── reports.json      ← Fraud reports
│   │   └── index.js              ← Express server entry point
│   ├── .env                      ← JWT secret, port config
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx              ← Home page with animated hash
    │   │   ├── Login.jsx                ← Login with quick-fill demo buttons
    │   │   ├── PublicVerify.jsx         ← QR scan landing page
    │   │   ├── institution/
    │   │   │   ├── Dashboard.jsx        ← Issued credentials table + revoke
    │   │   │   ├── IssueCredential.jsx  ← Issue form with mining animation
    │   │   │   └── BlockExplorer.jsx    ← Visual blockchain explorer
    │   │   ├── student/
    │   │   │   └── Dashboard.jsx        ← My credentials + QR + PDF + hash
    │   │   └── employer/
    │   │       └── VerifyPortal.jsx     ← Hash lookup + QR upload + report
    │   ├── components/
    │   │   └── Navbar.jsx               ← Role-aware navigation + logout
    │   ├── context/
    │   │   └── AuthContext.jsx          ← JWT auth state management
    │   └── App.jsx                      ← Routes + protected route wrapper
    ├── tailwind.config.js               ← Cyberpunk color theme
    └── package.json
```

---

## 📧 Email Preview (Mock SMTP)

The project uses **Ethereal** — a fake SMTP service. No real email is sent.

After issuing a credential, check the **backend terminal** for:
```
📬 Preview URL: https://ethereal.email/message/...
```
Open this URL in a browser to see the full HTML email with embedded QR code and PDF attachment.

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/credentials/issue` | Institution | Issue a new credential |
| GET | `/api/credentials/issued` | Institution | List all issued credentials |
| GET | `/api/credentials/chain` | Institution | Get full blockchain |
| POST | `/api/credentials/revoke/:id` | Institution | Revoke a credential |
| GET | `/api/credentials/my` | Student | Get my credentials |
| GET | `/api/credentials/:id/pdf` | Student | Download PDF certificate |
| GET | `/api/verify/:hash` | Public | Verify by SHA-256 hash |
| POST | `/api/verify/by-id` | Public | Verify by credential ID |
| GET | `/api/verify/chain/status` | Public | Chain integrity status |
| POST | `/api/reports` | Public | Submit fraud report |

---

## 📌 Important Notes

- `chain.json` is **auto-created** on first backend start — do not create it manually
- All seed account passwords are `password` (bcrypt hashed in `users.json`)
- The blockchain reloads from disk on every verification — live tamper detection works instantly
- To reset the blockchain, simply delete `backend/src/data/chain.json` and restart the backend

---

*Built for the internal hackathon round — demonstrating blockchain concepts for academic credential verification.*
