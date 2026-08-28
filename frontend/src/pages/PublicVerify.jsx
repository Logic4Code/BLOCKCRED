import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Shield, AlertTriangle, Ban, Lock, ExternalLink } from 'lucide-react';

export default function PublicVerify() {
  const { hash } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hash) {
      axios.get(`/api/verify/${hash}`)
        .then(res => setResult(res.data))
        .catch(() => setResult({ status: 'NOT_FOUND', message: 'Verification failed', verified: false }))
        .finally(() => setLoading(false));
    }
  }, [hash]);

  const statusStyle = {
    VERIFIED: { icon: <Shield className="w-10 h-10" />, color: 'text-cyber-green', border: 'border-cyber-green/40', bg: 'bg-cyber-green/5' },
    TAMPERED: { icon: <AlertTriangle className="w-10 h-10" />, color: 'text-red-400', border: 'border-red-500/60', bg: 'bg-red-500/10' },
    REVOKED: { icon: <Ban className="w-10 h-10" />, color: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/5' },
    NOT_FOUND: { icon: '❓', color: 'text-orange-400', border: 'border-orange-500/40', bg: 'bg-orange-500/5' },
    SUPERSEDED: { icon: '↑', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/5' },
  };

  const style = result ? (statusStyle[result.status] || statusStyle.NOT_FOUND) : null;

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center">
          <Lock className="w-4 h-4 text-cyber-cyan" />
        </div>
        <span className="font-black text-xl tracking-wider">BLOCK<span className="text-cyber-cyan">CRED</span></span>
      </Link>

      {loading ? (
        <div className="text-cyber-cyan animate-pulse font-mono text-center">
          <div className="w-12 h-12 border-2 border-cyber-cyan/20 border-t-cyber-cyan rounded-full animate-spin mx-auto mb-4" />
          Verifying on blockchain...
        </div>
      ) : result && style ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card w-full max-w-lg border ${style.border} ${style.bg} overflow-hidden`}
        >
          <div className="p-8 text-center border-b border-white/5">
            <div className={`${style.color} flex justify-center mb-3 ${result.status === 'TAMPERED' ? 'animate-pulse' : ''}`}>
              {style.icon}
            </div>
            <h1 className={`text-3xl font-black ${style.color}`}>{result.status}</h1>
            <p className="text-gray-400 text-sm mt-2">{result.message}</p>
          </div>

          {result.credential && (
            <div className="p-6 space-y-3">
              {[
                ['Student', result.credential.studentName],
                ['Student ID', result.credential.studentId],
                ['Course', result.credential.course],
                ['Grade', result.credential.grade],
                ['Issued By', result.credential.issuerName],
                ['Issue Date', result.credential.issuedAt ? new Date(result.credential.issuedAt).toLocaleDateString('en-IN') : '—'],
              ].map(([label, value]) => value && (
                <div key={label} className="flex justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-white font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-xs text-gray-600 mb-1 font-mono">Hash</p>
                <p className="text-xs text-cyber-green font-mono break-all">{hash}</p>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-white/5 flex gap-3 justify-center">
            <Link to="/employer" className="flex items-center gap-2 text-sm text-cyber-cyan hover:underline">
              <ExternalLink className="w-4 h-4" /> Full Verification Portal
            </Link>
          </div>
        </motion.div>
      ) : null}

      <p className="mt-6 text-xs text-gray-700">Secured by SHA-256 blockchain • BlockCred v1.0</p>
    </div>
  );
}
