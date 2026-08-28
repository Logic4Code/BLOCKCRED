import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Award, Download, Copy, QrCode } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/credentials/my')
      .then(res => setCredentials(res.data.credentials || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    toast.success('Hash copied to clipboard!');
  };

  const downloadPDF = async (credentialId) => {
    try {
      const res = await axios.get(`/api/credentials/${credentialId}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `credential_${credentialId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF download failed');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">

        {/* Header */}
        <div className="mb-8">
          <div className="section-label mb-1">Student Portal</div>
          <h1 className="text-3xl font-black text-white">{user?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Student ID: <span className="text-cyber-green font-mono">{user?.studentId}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Credentials', value: credentials.length,                                                  color: 'text-cyber-cyan'  },
            { label: 'Active',            value: credentials.filter(c => c.data?.status === 'active').length,         color: 'text-cyber-green' },
            { label: 'Superseded',        value: credentials.filter(c => c.data?.status === 'superseded').length,     color: 'text-purple-400'  },
          ].map(s => (
            <div key={s.label} className="glass-card p-5 border border-white/5 text-center">
              <div className={`text-3xl font-black ${s.color}`}>{loading ? '—' : s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Credentials list */}
        {loading ? (
          <div className="text-center text-gray-500 animate-pulse py-20">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="glass-card p-12 text-center border border-white/5">
            <Award className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No credentials issued to you yet.</p>
            <p className="text-xs text-gray-600 mt-1">Contact your institution to issue credentials.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {credentials.map((block, i) => (
              <motion.div
                key={block.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card border overflow-hidden ${
                  block.data.status === 'active'     ? 'border-cyber-cyan/20'  :
                  block.data.status === 'superseded' ? 'border-purple-500/20' :
                                                       'border-red-500/20'
                }`}
              >
                <div className="p-6">
                  {/* Status + ID row */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span className={
                        block.data.status === 'active'     ? 'badge-verified'   :
                        block.data.status === 'superseded' ? 'badge-superseded' :
                                                             'badge-revoked'
                      }>
                        {block.data.status === 'active'     ? '✓ ACTIVE'      :
                         block.data.status === 'superseded' ? '↑ SUPERSEDED'  : '✗ REVOKED'}
                      </span>
                      <span className="font-mono text-xs text-gray-500">{block.data.credentialId}</span>
                      {block.data.version > 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                          v{block.data.version}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">Block #{block.index}</span>
                  </div>

                  {/* Main details */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">COURSE</p>
                      <p className="text-white font-bold text-lg">{block.data.course}</p>
                      {block.data.specialization && (
                        <p className="text-gray-400 text-sm">{block.data.specialization}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">GRADE</p>
                        <p className="text-cyber-gold font-black text-xl">{block.data.grade}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">CGPA</p>
                        <p className="text-white font-bold">{block.data.cgpa || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">YEAR</p>
                        <p className="text-white text-sm">{block.data.yearOfPassing}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">ISSUED BY</p>
                        <p className="text-cyber-cyan text-sm font-medium">{block.data.issuerName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hash */}
                  <div className="hash-display flex items-center justify-between gap-2 mb-4">
                    <span className="truncate text-xs">{block.hash}</span>
                    <button onClick={() => copyHash(block.hash)} className="shrink-0 text-cyber-green hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* QR + Actions */}
                  <div className="flex flex-wrap items-start gap-4">
                    {block.qrCode && (
                      <div className="text-center">
                        <img src={block.qrCode} alt="QR" className="w-24 h-24 rounded-lg border border-cyber-green/30" />
                        <p className="text-xs text-gray-600 mt-1">Verification QR</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 flex-1">
                      <button
                        onClick={() => downloadPDF(block.data.credentialId)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                      <button
                        onClick={() => copyHash(block.hash)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10 transition-all"
                      >
                        <Copy className="w-4 h-4" /> Copy Hash
                      </button>
                      <a
                        href={block.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-white/10 text-gray-400 hover:text-white hover:bg-cyber-surface transition-all"
                      >
                        <QrCode className="w-4 h-4" /> Verify Online
                      </a>
                    </div>
                  </div>

                  {block.data.status === 'superseded' && block.data.supersededBy && (
                    <div className="mt-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-xs text-purple-400">
                      ↑ This credential was updated. New ID:{' '}
                      <span className="font-mono">{block.data.supersededBy}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

