import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FileEdit, Send, ChevronLeft, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const editableFields = [
  { name: 'studentName', label: 'Student Name' },
  { name: 'course', label: 'Course / Degree' },
  { name: 'specialization', label: 'Specialization' },
  { name: 'grade', label: 'Grade' },
  { name: 'cgpa', label: 'CGPA' },
  { name: 'yearOfPassing', label: 'Year of Passing' },
  { name: 'duration', label: 'Duration' },
];

export default function RequestModification() {
  const { credentialId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState('');
  const [changes, setChanges] = useState({});
  const [activeField, setActiveField] = useState('');
  const [changeValue, setChangeValue] = useState('');

  const addChange = () => {
    if (!activeField || !changeValue) return;
    setChanges(prev => ({ ...prev, [activeField]: changeValue }));
    setChangeValue('');
  };

  const removeChange = (field) => {
    setChanges(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { toast.error('Please provide a reason'); return; }
    setLoading(true);
    try {
      await axios.post('/api/credentials/request-modification', {
        credentialId,
        reason,
        requestedChanges: changes
      });
      setSubmitted(true);
      toast.success('Modification request submitted!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cyber-bg grid-bg">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-24 pb-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 border border-cyber-green/30 text-center">
            <div className="w-16 h-16 rounded-full bg-cyber-green/20 border border-cyber-green/40 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-cyber-green" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Request Submitted</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your modification request has been sent to the institution. You'll receive a new credential (with a new QR code and hash) once approved.
            </p>
            <button onClick={() => navigate('/student')} className="btn-cyan w-full">Back to My Credentials</button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <button onClick={() => navigate('/student')} className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> My Credentials
        </button>
        <div className="section-label mb-1">Modification Request</div>
        <h1 className="text-2xl font-black text-white mb-1">Request Credential Update</h1>
        <p className="text-gray-500 text-sm mb-2">
          Credential: <span className="font-mono text-cyber-cyan">{credentialId}</span>
        </p>
        <div className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-xs text-gray-400 mb-8">
          ℹ️ Once approved, a <strong className="text-white">new blockchain block</strong> is created with a <strong className="text-white">new QR code and hash</strong>. Your old credential is marked as superseded.
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reason */}
          <div className="glass-card p-5 border border-white/5">
            <label className="block text-xs text-gray-400 mb-2 tracking-wider font-medium">
              REASON FOR MODIFICATION <span className="text-cyber-cyan">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Name spelling correction, CGPA calculation error, wrong year of passing..."
              className="cyber-input resize-none"
              rows={3}
              required
            />
          </div>

          {/* Field changes */}
          <div className="glass-card p-5 border border-white/5">
            <label className="block text-xs text-gray-400 mb-3 tracking-wider font-medium">
              SPECIFIC FIELD CORRECTIONS (optional)
            </label>
            <div className="flex gap-2 mb-3">
              <select
                value={activeField}
                onChange={e => setActiveField(e.target.value)}
                className="cyber-input flex-1 text-sm"
              >
                <option value="">Select field to correct...</option>
                {editableFields.map(f => (
                  <option key={f.name} value={f.name}>{f.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={changeValue}
                onChange={e => setChangeValue(e.target.value)}
                placeholder="New value"
                className="cyber-input flex-1 text-sm"
              />
              <button type="button" onClick={addChange} className="px-4 py-2 rounded-lg bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/30 text-sm font-semibold transition-all">
                Add
              </button>
            </div>
            {Object.entries(changes).length > 0 && (
              <div className="space-y-2">
                {Object.entries(changes).map(([field, val]) => (
                  <div key={field} className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-surface border border-white/5 text-sm">
                    <span className="text-gray-400">{editableFields.find(f => f.name === field)?.label || field}</span>
                    <span className="text-cyber-gold font-medium">{val}</span>
                    <button type="button" onClick={() => removeChange(field)} className="text-red-400 hover:text-red-300 text-xs ml-2">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-green w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-cyber-bg/40 border-t-cyber-bg rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-5 h-5" /> Submit Modification Request</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
