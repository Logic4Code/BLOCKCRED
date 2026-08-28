import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Search, QrCode, Shield, AlertTriangle, Ban, ChevronRight, Copy, Flag, X, Check, Lock, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import toast from 'react-hot-toast';

const statusConfig = {
  VERIFIED: {
    icon: <Shield className="w-8 h-8" />,
    color: 'cyber-green',
    borderClass: 'border-cyber-green/40',
    bgClass: 'bg-cyber-green/5',
    textClass: 'text-cyber-green',
    label: 'VERIFIED ✓',
    desc: 'Credential is authentic and blockchain-verified.'
  },
  TAMPERED: {
    icon: <AlertTriangle className="w-8 h-8" />,
    color: 'red',
    borderClass: 'border-red-500/60',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    label: 'TAMPERED ⚠',
    desc: 'BLOCKCHAIN INTEGRITY VIOLATION — Do not accept this credential.'
  },
  REVOKED: {
    icon: <Ban className="w-8 h-8" />,
    color: 'red',
    borderClass: 'border-red-500/40',
    bgClass: 'bg-red-500/5',
    textClass: 'text-red-400',
    label: 'REVOKED ✗',
    desc: 'This credential has been revoked by the issuing institution.'
  },
  NOT_FOUND: {
    icon: <X className="w-8 h-8" />,
    color: 'orange',
    borderClass: 'border-orange-500/40',
    bgClass: 'bg-orange-500/5',
    textClass: 'text-orange-400',
    label: 'NOT FOUND',
    desc: 'No credential found with this identifier.'
  },
  SUPERSEDED: {
    icon: <ChevronRight className="w-8 h-8" />,
    color: 'purple',
    borderClass: 'border-purple-500/40',
    bgClass: 'bg-purple-500/5',
    textClass: 'text-purple-400',
    label: 'SUPERSEDED',
    desc: 'This credential was updated. A newer version exists.'
  }
};

function ReportModal({ credential, hash, onClose }) {
  const [form, setForm] = useState({ reporterName: '', reporterEmail: '', reporterOrganization: '', reason: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/reports', {
        credentialId: credential?.credentialId,
        blockHash: hash,
        ...form
      });
      setDone(true);
      toast.success('Report filed successfully');
    } catch {
      toast.error('Failed to file report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-card border border-red-500/30 w-full max-w-md p-7"
      >
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-cyber-green/20 border border-cyber-green/40 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-cyber-green" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
            <p className="text-gray-400 text-sm mb-5">Thank you. Our team will investigate this credential.</p>
            <button onClick={onClose} className="btn-outline w-full">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-red-400 flex items-center gap-2"><Flag className="w-5 h-5" /> Report Suspicious Credential</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {credential && (
              <div className="p-3 rounded-lg bg-cyber-surface border border-white/5 mb-4 text-xs">
                <span className="text-gray-500">Credential: </span>
                <span className="text-cyber-cyan font-mono">{credential.credentialId}</span>
                <span className="text-gray-500 ml-3">Student: </span>
                <span className="text-white">{credential.studentName}</span>
              </div>
            )}
            <form onSubmit={submit} className="space-y-3">
              {[
                { name: 'reporterName', label: 'Your Name', placeholder: 'HR Manager', required: false },
                { name: 'reporterEmail', label: 'Your Email', placeholder: 'hr@company.com', type: 'email' },
                { name: 'reporterOrganization', label: 'Organization', placeholder: 'TechCorp India' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-500 mb-1 tracking-wider">{f.label.toUpperCase()}</label>
                  <input
                    type={f.type || 'text'}
                    name={f.name}
                    value={form[f.name]}
                    onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="cyber-input text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1 tracking-wider">REASON <span className="text-red-400">*</span></label>
                <select
                  value={form.reason}
                  onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                  className="cyber-input text-sm"
                  required
                >
                  <option value="">Select reason...</option>
                  <option>Suspected forgery / fake document</option>
                  <option>Credential details don't match candidate</option>
                  <option>Institution does not recognize this student</option>
                  <option>QR code leads to different credential</option>
                  <option>Other suspicious activity</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 tracking-wider">ADDITIONAL DETAILS</label>
                <textarea
                  value={form.details}
                  onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                  placeholder="Any additional observations..."
                  className="cyber-input text-sm resize-none"
                  rows={3}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-red w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Flag className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function EmployerPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('hash'); // 'hash' | 'qr'
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const fileInputRef = useRef();
  const scannerRef = useRef(null);
  const [scannerActive, setScannerActive] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const verify = async (hashOrId) => {
    const query = (hashOrId || input).trim();
    if (!query) { toast.error('Enter a credential hash or ID'); return; }
    setLoading(true);
    setResult(null);
    try {
      // Try by hash first (64 hex chars)
      let res;
      if (/^[0-9a-f]{64}$/i.test(query)) {
        res = await axios.get(`/api/verify/${query}`);
      } else {
        // Try by credential ID
        res = await axios.post('/api/verify/by-id', { credentialId: query });
      }
      setResult(res.data);
    } catch (err) {
      setResult({ status: 'NOT_FOUND', message: err.response?.data?.error || 'Verification failed', verified: false });
    } finally {
      setLoading(false);
    }
  };

  // QR file upload decode
  const handleQRFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrFile(file);
    try {
      // Use html5-qrcode to decode the image
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader-hidden');
      const result = await html5QrCode.scanFileV2(file, false);
      const decoded = result.decodedText;
      // Extract hash from URL if needed
      const hashMatch = decoded.match(/verify\/([0-9a-f]{64})/i);
      const toVerify = hashMatch ? hashMatch[1] : decoded;
      setInput(toVerify);
      await verify(toVerify);
      await html5QrCode.clear();
    } catch (err) {
      toast.error('Could not decode QR code from image');
    }
  };

  const config = result ? (statusConfig[result.status] || statusConfig.NOT_FOUND) : null;

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      {/* Auth-aware Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-cyber-bg/90">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyber-cyan" />
            </div>
            <span className="font-black text-lg tracking-wider">BLOCK<span className="text-cyber-cyan">CRED</span></span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 px-3 py-1 rounded-full border border-white/10">🏢 Employer/Verifier Portal</span>

            {user ? (
              /* Logged-in state: show user badge + portal links + logout */
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-400/30 bg-cyber-surface">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-xs text-gray-300 font-medium">{user.name}</span>
                  <span className="text-xs text-purple-400 font-semibold capitalize">{user.company || user.role}</span>
                </div>
                <Link
                  to="/login"
                  className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-cyber-surface transition-all"
                >
                  Switch Portal
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </>
            ) : (
              /* Logged-out state: show login link */
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-cyber-surface"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hidden QR reader element */}
      <div id="qr-reader-hidden" style={{ display: 'none' }} />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/5 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-purple-400 font-mono tracking-widest">PUBLIC VERIFICATION PORTAL</span>
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-3">Verify a Credential</h1>
          <p className="text-gray-400">Paste the blockchain hash, credential ID, or scan a QR code for instant tamper-proof verification.</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-cyber-surface border border-white/5">
          <button
            onClick={() => setMode('hash')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
              mode === 'hash' ? 'bg-cyber-card text-white border border-cyber-cyan/30 text-cyber-cyan' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Search className="w-4 h-4" /> Hash / ID Lookup
          </button>
          <button
            onClick={() => setMode('qr')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
              mode === 'qr' ? 'bg-cyber-card text-white border border-purple-500/30 text-purple-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <QrCode className="w-4 h-4" /> Scan QR Code
          </button>
        </div>

        {/* Hash Input Mode */}
        {mode === 'hash' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 border border-white/5 mb-6">
            <label className="block text-xs text-gray-500 mb-2 tracking-wider">BLOCKCHAIN HASH OR CREDENTIAL ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
                placeholder="Enter 64-char hash (e.g. 00abc...) or CRED-XXXXXXXX"
                className="cyber-input flex-1 font-mono text-sm"
              />
              <button
                onClick={() => verify()}
                disabled={loading}
                className="btn-cyan px-5 shrink-0 disabled:opacity-50"
              >
                {loading ? <span className="w-5 h-5 border-2 border-cyber-bg/40 border-t-cyber-bg rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              The hash or credential ID can be found on the certificate PDF or email sent to the student.
            </p>
          </motion.div>
        )}

        {/* QR Mode */}
        {mode === 'qr' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 border border-purple-500/20 mb-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-500/30 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500/60 hover:bg-purple-500/5 transition-all"
            >
              <QrCode className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-gray-300 font-medium mb-1">Upload QR Code Image</p>
              <p className="text-gray-600 text-sm">Click to select a QR code image (PNG/JPG)</p>
              {qrFile && <p className="mt-2 text-xs text-purple-400">{qrFile.name}</p>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleQRFile}
            />
            {loading && (
              <div className="mt-4 text-center text-purple-400 text-sm animate-pulse flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                Decoding QR & verifying on blockchain...
              </div>
            )}
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && config && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`glass-card border ${config.borderClass} ${config.bgClass} overflow-hidden mb-4`}
            >
              {/* Status header */}
              <div className={`p-6 flex items-center gap-4 border-b border-white/5`}>
                <div className={`${config.textClass} ${result.status === 'TAMPERED' ? 'animate-pulse' : ''}`}>
                  {config.icon}
                </div>
                <div>
                  <div className={`text-2xl font-black ${config.textClass}`}>{config.label}</div>
                  <p className="text-gray-400 text-sm mt-0.5">{config.desc}</p>
                </div>
              </div>

              {/* Credential details */}
              {result.credential && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Student Name', value: result.credential.studentName },
                      { label: 'Student ID', value: result.credential.studentId },
                      { label: 'Course', value: result.credential.course, full: true },
                      { label: 'Specialization', value: result.credential.specialization },
                      { label: 'Grade', value: result.credential.grade },
                      { label: 'CGPA', value: result.credential.cgpa },
                      { label: 'Year', value: result.credential.yearOfPassing },
                      { label: 'Issued By', value: result.credential.issuerName },
                      { label: 'Issue Date', value: result.credential.issuedAt ? new Date(result.credential.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                      { label: 'Credential ID', value: result.credential.credentialId, mono: true },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                        <p className="text-xs text-gray-500 mb-0.5 tracking-wider">{f.label.toUpperCase()}</p>
                        <p className={`text-sm font-medium text-white ${f.mono ? 'font-mono text-cyber-cyan text-xs' : ''}`}>{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chain integrity — only show when invalid */}
                  {result.chainIntegrity && !result.chainIntegrity.valid && (
                    <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      {result.chainIntegrity.reason}
                    </div>
                  )}
                  {result.status === 'VERIFIED' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-cyber-green/5 border border-cyber-green/20 text-cyber-green">
                      <Shield className="w-4 h-4" />
                      Verified
                    </div>
                  )}

                  {/* Revocation details */}
                  {result.revocationDetails && (
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs">
                      <p className="text-red-400 font-semibold mb-1">Revocation Record:</p>
                      <p className="text-gray-400">Reason: {result.revocationDetails.reason}</p>
                      <p className="text-gray-500">Date: {new Date(result.revocationDetails.revokedAt).toLocaleString('en-IN')}</p>
                    </div>
                  )}

                  {/* QR on verified */}
                  {result.status === 'VERIFIED' && result.qrCode && (
                    <div className="flex items-center gap-4">
                      <img src={result.qrCode} alt="QR" className="w-20 h-20 rounded-lg border border-cyber-green/30" />
                      <p className="text-xs text-gray-500">Verification QR — share with this result as proof of authenticity.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="p-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Flag className="w-4 h-4" /> Report Suspicious
                </button>
                <button
                  onClick={() => { setResult(null); setInput(''); setQrFile(null); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-white/10 text-gray-400 hover:text-white hover:bg-cyber-surface transition-all"
                >
                  <Search className="w-4 h-4" /> New Search
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info footer */}
        <div className="text-center mt-8 text-xs text-gray-600 space-y-1">
          <p>🔒 This portal uses SHA-256 blockchain verification. No login required.</p>
          <p>Results are cryptographically guaranteed and cannot be faked.</p>
        </div>
      </div>

      <AnimatePresence>
        {showReport && <ReportModal credential={result?.credential} hash={input} onClose={() => setShowReport(false)} />}
      </AnimatePresence>
    </div>
  );
}
