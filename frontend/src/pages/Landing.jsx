import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Link as LinkIcon, Eye, Award, AlertTriangle, ChevronRight, Lock, Globe, Users } from 'lucide-react';

const features = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Tamper-Proof Credentials',
    desc: 'SHA-256 hash-chained blocks ensure any modification is instantly detected. The chain never lies.',
    color: 'cyan'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Verification',
    desc: 'Scan a QR code or enter a hash — verified in milliseconds. No calls to institutions needed.',
    color: 'green'
  },
  {
    icon: <LinkIcon className="w-6 h-6" />,
    title: 'Blockchain-Backed',
    desc: 'Every credential is a block in an immutable chain. Revocations and modifications are fully auditable.',
    color: 'purple'
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'Public Verifiability',
    desc: 'Employers verify credentials without any portal login. Full transparency, zero friction.',
    color: 'cyan'
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Digital Certificates',
    desc: 'Cyberpunk-styled PDF certificates with embedded QR codes sent directly to students via email.',
    color: 'green'
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: 'Fraud Reporting',
    desc: 'Employers can flag suspicious credentials. Every report is logged and auditable.',
    color: 'purple'
  }
];

const portals = [
  {
    role: 'institution',
    icon: '🏛️',
    title: 'Institution Portal',
    desc: 'Issue blockchain-secured credentials, manage revocations, explore the chain.',
    actions: ['Issue credentials', 'Revoke & manage', 'Blockchain explorer'],
    color: 'cyan',
    path: '/login'
  },
  {
    role: 'student',
    icon: '🎓',
    title: 'Student Portal',
    desc: 'View your credentials, download certificates, and share your QR code.',
    actions: ['View credentials', 'Download PDF + QR', 'Copy & share hash'],
    color: 'green',
    path: '/login'
  },
  {
    role: 'employer',
    icon: '🏢',
    title: 'Employer Portal',
    desc: 'Verify credentials instantly via hash or QR scan. Report fraud.',
    actions: ['Scan QR code', 'Hash-based lookup', 'Report tampering'],
    color: 'purple',
    path: '/employer'
  }
];

const colorMap = {
  cyan: { text: 'text-cyber-cyan', border: 'border-cyber-cyan/30', bg: 'bg-cyber-cyan/10', icon: 'text-cyber-cyan' },
  green: { text: 'text-cyber-green', border: 'border-cyber-green/30', bg: 'bg-cyber-green/10', icon: 'text-cyber-green' },
  purple: { text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', icon: 'text-purple-400' }
};

function AnimatedHash() {
  const chars = '0123456789abcdef';
  const [hash, setHash] = useState('');
  useEffect(() => {
    const gen = () => Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setHash(gen());
    const i = setInterval(() => setHash(gen()), 2000);
    return () => clearInterval(i);
  }, []);
  return <span className="font-mono text-cyber-green/60 text-xs break-all">{hash}</span>;
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-cyber-bg/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyber-cyan" />
            </div>
            <span className="font-black text-xl tracking-wider">
              <span className="text-white">BLOCK</span>
              <span className="text-cyber-cyan">CRED</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/employer" className="text-sm text-gray-400 hover:text-white transition-colors">Verify</Link>
            <Link to="/login" className="btn-cyan text-sm px-4 py-2">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            <span className="text-xs text-cyber-cyan font-mono tracking-widest">BLOCKCHAIN SECURED • TAMPER-PROOF • INSTANT VERIFY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-black leading-tight mb-6"
          >
            Academic Credentials
            <br />
            <span className="text-gradient-cyan">On The Blockchain</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Eliminate fake degrees forever. Institutions issue cryptographically signed credentials.
            Employers verify in seconds — no calls, no delays, no fraud.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link to="/login" className="btn-cyan flex items-center gap-2 px-8 py-4 text-base">
              Get Started <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/employer" className="btn-outline flex items-center gap-2 px-8 py-4 text-base">
              <Eye className="w-4 h-4" /> Verify a Credential
            </Link>
          </motion.div>

          {/* Live hash animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 glass-card p-5 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <span className="text-xs text-gray-500 font-mono tracking-wider">LIVE CHAIN HASH</span>
            </div>
            <AnimatedHash />
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600 font-mono">
              <span>Block #∞</span>
              <span>•</span>
              <span>SHA-256</span>
              <span>•</span>
              <span className="text-cyber-green">✓ CHAIN VALID</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-white/5 bg-cyber-surface/50">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Hash Algorithm', value: 'SHA-256' },
            { label: 'Verification Time', value: '<100ms' },
            { label: 'Tamper Detection', value: '100%' },
            { label: 'Chain Integrity', value: 'Immutable' }
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black text-gradient-cyan">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1 tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Portals */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label mb-3">Three Portals. One System.</div>
            <h2 className="text-4xl font-black">Choose Your Role</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {portals.map((p, i) => {
              const c = colorMap[p.color];
              return (
                <motion.div
                  key={p.role}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`glass-card p-7 border ${c.border} hover:shadow-lg transition-all duration-300 group`}
                >
                  <div className={`text-4xl mb-4`}>{p.icon}</div>
                  <h3 className={`text-xl font-bold mb-2 ${c.text}`}>{p.title}</h3>
                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">{p.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {p.actions.map(a => (
                      <li key={a} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.bg} border ${c.border}`} style={{ background: p.color === 'cyan' ? '#00e5ff' : p.color === 'green' ? '#00ff9d' : '#7c3aed' }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={p.path}
                    className={`flex items-center gap-2 text-sm font-semibold ${c.text} group-hover:gap-3 transition-all`}
                  >
                    Access Portal <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-cyber-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label mb-3">Capabilities</div>
            <h2 className="text-4xl font-black">Built For Trust</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="glass-card p-6 border border-white/5 hover:border-cyber-cyan/20 transition-all"
                >
                  <div className={`${c.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.text}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label mb-3">Process</div>
            <h2 className="text-4xl font-black">How BlockCred Works</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Institution Issues Credential', desc: 'Fill student details → system creates a blockchain block with SHA-256 hash linked to the previous block.' },
              { step: '02', title: 'Student Receives Certificate', desc: 'Automated email with PDF certificate, QR code, and unique blockchain hash.' },
              { step: '03', title: 'Employer Scans & Verifies', desc: 'Scan the QR or paste the hash → verified in milliseconds. VERIFIED / TAMPERED / REVOKED result.' },
              { step: '04', title: 'Tamper = Instant Detection', desc: 'Any modification breaks the SHA-256 chain. The system immediately flags it as TAMPERED.' }
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-5 glass-card p-5 border border-white/5"
              >
                <div className="text-3xl font-black text-cyber-cyan/30 font-mono w-12 shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card p-12 border border-cyber-cyan/20"
          style={{ boxShadow: '0 0 60px rgba(0,229,255,0.05)' }}
        >
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-3xl font-black mb-4">Ready to Eliminate Credential Fraud?</h2>
          <p className="text-gray-400 mb-8">Join the blockchain revolution in academic verification.</p>
          <Link to="/login" className="btn-cyan px-10 py-4 text-base inline-flex items-center gap-2">
            Launch Portal <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-cyber-cyan" />
          <span className="font-black tracking-wider text-sm">BLOCK<span className="text-cyber-cyan">CRED</span></span>
        </div>
        <p className="text-gray-600 text-xs">Blockchain Credential Verification System • SHA-256 Secured • Immutable</p>
      </footer>
    </div>
  );
}
