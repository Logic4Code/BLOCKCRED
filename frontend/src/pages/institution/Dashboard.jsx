import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Award, Plus, Link as LinkIcon, Ban, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon, label, value, color, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 border border-white/5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
      <p className="text-sm text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/credentials/issued'),
      axios.get('/api/verify/chain/status')
    ]).then(([credsRes, chainRes]) => {
      setCredentials(credsRes.data.credentials || []);
      setChainStatus(chainRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = credentials.filter(c => c.data?.status === 'active').length;
  const revoked = credentials.filter(c => c.data?.status === 'revoked').length;
  const total = credentials.length;

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="section-label mb-1">Institution Portal</div>
            <h1 className="text-3xl font-black text-white">{user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
          </div>
          <Link to="/institution/issue" className="btn-cyan flex items-center gap-2 w-fit">
            <Plus className="w-4 h-4" /> Issue New Credential
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Award className="w-5 h-5 text-cyber-cyan" />} label="Total Issued" value={loading ? '—' : total} color="bg-cyber-cyan/10" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-cyber-green" />} label="Active" value={loading ? '—' : active} color="bg-cyber-green/10" />
          <StatCard icon={<Ban className="w-5 h-5 text-red-400" />} label="Revoked" value={loading ? '—' : revoked} color="bg-red-500/10" />
          <StatCard
            icon={<LinkIcon className="w-5 h-5 text-purple-400" />}
            label="Chain Blocks"
            value={loading ? '—' : (chainStatus?.totalBlocks || 0)}
            color="bg-purple-500/10"
            sub={chainStatus?.isValid ? '✅ Chain Valid' : '❌ Compromised'}
          />
        </div>

        {/* Chain Status Banner */}
        {chainStatus && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 ${
            chainStatus.isValid
              ? 'bg-cyber-green/5 border-cyber-green/30'
              : 'bg-red-500/10 border-red-500/40 animate-pulse'
          }`}>
            <span className="text-2xl">{chainStatus.isValid ? '🔗' : '⚠️'}</span>
            <div>
              <p className={`font-semibold text-sm ${chainStatus.isValid ? 'text-cyber-green' : 'text-red-400'}`}>
                {chainStatus.isValid ? 'Blockchain Integrity: VALID' : 'ALERT: Blockchain Integrity COMPROMISED'}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Latest Hash: {chainStatus.latestHash?.slice(0, 32)}...
              </p>
            </div>
            <Link to="/institution/explorer" className="ml-auto text-xs text-cyber-cyan hover:underline flex items-center gap-1">
              Explorer <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Credentials Table */}
        <div className="glass-card border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyber-cyan" /> Issued Credentials
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm animate-pulse">Loading credentials...</div>
          ) : credentials.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No credentials issued yet.</p>
              <Link to="/institution/issue" className="mt-4 btn-cyan inline-flex items-center gap-2 text-sm px-4 py-2">
                <Plus className="w-4 h-4" /> Issue First Credential
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-semibold tracking-wider">CREDENTIAL ID</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-semibold tracking-wider">STUDENT</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-semibold tracking-wider">COURSE</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-semibold tracking-wider">GRADE</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-semibold tracking-wider">STATUS</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-semibold tracking-wider">ISSUED</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-semibold tracking-wider">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {credentials.map((block, i) => (
                    <motion.tr
                      key={block.hash}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-cyber-surface/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-cyber-cyan">{block.data.credentialId}</td>
                      <td className="px-5 py-3">
                        <div className="text-white font-medium">{block.data.studentName}</div>
                        <div className="text-xs text-gray-500">{block.data.studentId}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-300 max-w-[200px] truncate">{block.data.course}</td>
                      <td className="px-5 py-3">
                        <span className="font-bold text-cyber-gold">{block.data.grade}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={
                          block.data.status === 'active'   ? 'badge-verified' :
                          block.data.status === 'revoked'  ? 'badge-revoked'  :
                                                             'badge-superseded'
                        }>
                          {block.data.status === 'active' ? '✓' : block.data.status === 'revoked' ? '✗' : '↑'} {block.data.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {new Date(block.data.issuedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3">
                        <RevokeButton
                          credentialId={block.data.credentialId}
                          status={block.data.status}
                          onRevoke={() => setCredentials(prev =>
                            prev.map(c => c.data.credentialId === block.data.credentialId
                              ? { ...c, data: { ...c.data, status: 'revoked' } }
                              : c
                            )
                          )}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RevokeButton({ credentialId, status, onRevoke }) {
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    const reason = window.prompt('Enter revocation reason:');
    if (!reason) return;
    setLoading(true);
    try {
      await axios.post(`/api/credentials/revoke/${credentialId}`, { reason });
      onRevoke();
    } catch (e) {
      alert(e.response?.data?.error || 'Revocation failed');
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'active') return <span className="text-xs text-gray-600">—</span>;
  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:bg-red-500/10 px-2.5 py-1 rounded transition-all disabled:opacity-50"
    >
      {loading ? '...' : 'Revoke'}
    </button>
  );
}
