import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Check, X, Clock, ChevronLeft, FileEdit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function ModificationRequests() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    axios.get('/api/credentials/modifications')
      .then(res => setMods(res.data.modifications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    try {
      const res = await axios.post(`/api/credentials/modifications/${id}/approve`);
      toast.success('Approved! New credential issued: ' + res.data.newCredentialId);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await axios.post(`/api/credentials/modifications/${id}/reject`, { reason });
      toast.success('Request rejected');
      load();
    } catch (e) {
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <button onClick={() => navigate('/institution')} className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>
        <div className="section-label mb-1">Requests</div>
        <h1 className="text-3xl font-black text-white mb-8">Modification Requests</h1>

        {loading ? (
          <div className="text-center text-gray-500 animate-pulse py-20">Loading...</div>
        ) : mods.length === 0 ? (
          <div className="glass-card p-12 text-center border border-white/5">
            <FileEdit className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No modification requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mods.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`glass-card p-6 border ${
                  mod.status === 'pending' ? 'border-cyber-orange/30' :
                  mod.status === 'approved' ? 'border-cyber-green/30' :
                  'border-red-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={
                        mod.status === 'pending' ? 'badge-pending' :
                        mod.status === 'approved' ? 'badge-verified' :
                        'badge-revoked'
                      }>
                        {mod.status === 'pending' ? <Clock className="w-3 h-3" /> : mod.status === 'approved' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {mod.status}
                      </span>
                      <span className="font-mono text-xs text-cyber-cyan">{mod.credentialId}</span>
                    </div>
                    <p className="text-white font-semibold">{mod.studentName}</p>
                    <p className="text-gray-500 text-sm mt-1">{mod.reason}</p>
                    {mod.requestedChanges && Object.keys(mod.requestedChanges).length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-cyber-surface border border-white/5 text-xs">
                        <p className="text-gray-400 mb-1 font-medium">Requested Changes:</p>
                        {Object.entries(mod.requestedChanges).map(([k, v]) => (
                          <div key={k} className="flex gap-2 text-gray-300">
                            <span className="text-gray-500">{k}:</span>
                            <span className="text-cyber-gold">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      Submitted: {new Date(mod.submittedAt).toLocaleString('en-IN')}
                    </p>
                    {mod.status === 'approved' && mod.newCredentialId && (
                      <p className="text-xs text-cyber-green mt-1">New ID: {mod.newCredentialId}</p>
                    )}
                  </div>

                  {mod.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(mod.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-cyber-green/10 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/20 transition-all"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(mod.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
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
