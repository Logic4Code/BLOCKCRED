import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Award, CheckCircle, Copy, Download, Mail, ChevronLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const fields = [
  { name: 'studentName', label: 'Student Full Name', placeholder: 'e.g. Arjun Kumar Sharma', required: true, col: 2 },
  { name: 'studentId', label: 'Student ID / Roll No.', placeholder: 'e.g. 2021CS001', required: true },
  { name: 'studentEmail', label: 'Student Email', placeholder: 'student@college.edu', required: true, type: 'email' },
  { name: 'course', label: 'Degree / Course', placeholder: 'e.g. B.Tech Computer Science', required: true, col: 2 },
  { name: 'specialization', label: 'Specialization / Branch', placeholder: 'e.g. Artificial Intelligence' },
  { name: 'grade', label: 'Grade', placeholder: 'e.g. A+', required: true },
  { name: 'cgpa', label: 'CGPA / Score', placeholder: 'e.g. 9.2/10' },
  { name: 'yearOfPassing', label: 'Year of Passing', placeholder: '2026' },
  { name: 'duration', label: 'Course Duration', placeholder: 'e.g. 4 Years' },
  { name: 'additionalInfo', label: 'Additional Remarks', placeholder: 'Honors, distinctions, etc.', col: 2 },
];

export default function IssueCredential() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/credentials/issue', form);
      setResult(res.data);
      toast.success('Credential issued & emailed to student!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = () => {
    navigator.clipboard.writeText(result.blockHash);
    toast.success('Hash copied!');
  };

  if (result) {
    return (
      <div className="min-h-screen bg-cyber-bg grid-bg">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Success */}
            <div className="glass-card p-8 border border-cyber-green/30 text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-cyber-green/20 border border-cyber-green/40 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-cyber-green" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">Credential Issued!</h2>
              <p className="text-gray-400 text-sm">Blockchain block created. Email sent to student.</p>
            </div>

            {/* Details */}
            <div className="glass-card p-6 border border-white/5 space-y-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1 tracking-wider">CREDENTIAL ID</p>
                <p className="font-mono text-cyber-cyan font-bold text-lg">{result.credentialId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 tracking-wider">BLOCK #{result.blockIndex}</p>
                <div className="hash-display flex items-start justify-between gap-2">
                  <span className="break-all">{result.blockHash}</span>
                  <button onClick={copyHash} className="shrink-0 text-cyber-green hover:text-white transition-colors mt-0.5">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 tracking-wider">VERIFICATION QR CODE</p>
                <div className="flex justify-center">
                  <img src={result.qrCode} alt="QR" className="w-40 h-40 rounded-lg border border-cyber-green/30" />
                </div>
                <p className="text-xs text-center text-gray-600 mt-2">Share with employer for instant verification</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/20 text-sm text-cyber-green">
                <Mail className="w-4 h-4 shrink-0" />
                <span>Certificate + QR emailed to student (check backend console for preview URL)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setResult(null)} className="btn-outline flex-1">Issue Another</button>
              <button onClick={() => navigate('/institution')} className="btn-cyan flex-1">Back to Dashboard</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/institution')} className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="section-label mb-1">Issue Credential</div>
          <h1 className="text-3xl font-black text-white">New Blockchain Credential</h1>
          <p className="text-gray-500 text-sm mt-1">Fill student details below. A blockchain block will be created and emailed to the student.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass-card p-7 border border-white/5 mb-6">
            <h3 className="section-label mb-5">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.name} className={f.col === 2 ? 'md:col-span-2' : ''}>
                  <label className="block text-xs text-gray-400 mb-2 font-medium tracking-wider">
                    {f.label.toUpperCase()} {f.required && <span className="text-cyber-cyan">*</span>}
                  </label>
                  <input
                    type={f.type || 'text'}
                    name={f.name}
                    placeholder={f.placeholder}
                    value={form[f.name] || ''}
                    onChange={handleChange}
                    required={f.required}
                    className="cyber-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20 mb-6 text-sm text-gray-400">
            <p className="font-semibold text-cyber-cyan mb-1">🔗 What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>A SHA-256 blockchain block is created and linked to the previous block</li>
              <li>A unique verification QR code and hash are generated</li>
              <li>A PDF certificate with QR is emailed to the student</li>
              <li>The credential is instantly verifiable by any employer</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cyan w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-cyber-bg/40 border-t-cyber-bg rounded-full animate-spin" />
                Mining Block & Sending Email...
              </>
            ) : (
              <>
                <Award className="w-5 h-5" /> Issue Credential on Blockchain
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
