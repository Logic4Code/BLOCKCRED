import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link2, Shield, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function BlockExplorer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/credentials/chain')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <button onClick={() => navigate('/institution')} className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="section-label mb-1">Blockchain Explorer</div>
            <h1 className="text-3xl font-black text-white">Live Chain Viewer</h1>
          </div>
          {data && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              data.summary.isValid ? 'border-cyber-green/30 bg-cyber-green/5 text-cyber-green' : 'border-red-500/40 bg-red-500/10 text-red-400'
            }`}>
              {data.summary.isValid ? <Shield className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span className="text-sm font-semibold">
                {data.summary.isValid ? 'Chain Integrity: VALID' : 'CHAIN COMPROMISED'}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 animate-pulse py-20">Loading blockchain...</div>
        ) : (
          <div className="space-y-3">
            {[...data.chain].reverse().map((block, i) => (
              <motion.div
                key={block.hash}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                className={`glass-card border overflow-hidden ${
                  block.index === 0 ? 'border-purple-500/30' :
                  block.data?.type === 'CREDENTIAL' ? 'border-cyber-cyan/20' :
                  block.data?.type === 'REVOCATION' ? 'border-red-500/20' :
                  'border-white/5'
                }`}
              >
                <div className="p-4 flex flex-wrap gap-4 items-start">
                  {/* Block # */}
                  <div className="shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                      block.index === 0 ? 'bg-purple-500/20 text-purple-400' :
                      block.data?.type === 'CREDENTIAL' ? 'bg-cyber-cyan/10 text-cyber-cyan' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      #{block.index}
                    </div>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        block.index === 0 ? 'bg-purple-500/20 text-purple-400' :
                        block.data?.type === 'CREDENTIAL' ? 'bg-cyber-cyan/10 text-cyber-cyan' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {block.data?.type || 'GENESIS'}
                      </span>
                      {block.data?.credentialId && (
                        <span className="text-xs text-gray-500 font-mono">{block.data.credentialId}</span>
                      )}
                      {block.data?.studentName && (
                        <span className="text-xs text-gray-300">{block.data.studentName}</span>
                      )}
                    </div>

                    <div className="font-mono text-xs text-cyber-green break-all mb-1">
                      Hash: {block.hash}
                    </div>
                    <div className="font-mono text-xs text-gray-600 break-all">
                      Prev: {block.previousHash}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-500">{new Date(block.timestamp).toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-600 mt-1">Nonce: {block.nonce}</div>
                    {block.data?.status && (
                      <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${
                        block.data.status === 'active' ? 'text-cyber-green bg-cyber-green/10' :
                        block.data.status === 'revoked' ? 'text-red-400 bg-red-500/10' :
                        'text-purple-400 bg-purple-500/10'
                      }`}>
                        {block.data.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chain link arrow */}
                {block.index > 0 && (
                  <div className="flex justify-center py-0.5 border-t border-white/5">
                    <Link2 className="w-3 h-3 text-gray-700 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
