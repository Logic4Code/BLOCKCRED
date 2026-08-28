import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { UserPlus, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', studentId: '', email: '', phone: '', password: 'password' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register-student', form);
      setSuccess(res.data);
      toast.success('Student registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cyber-bg grid-bg">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 border border-cyber-green/30 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-cyber-green/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-cyber-green" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Student Registered!</h2>
            <p className="text-gray-500 text-sm mb-6">Share the login details with the student.</p>

            <div className="space-y-3 text-left mb-6">
              {[
                { label: 'Name', value: success.student.name },
                { label: 'Student ID', value: success.student.studentId },
                { label: 'Login Email', value: success.student.email },
                { label: 'Password', value: success.defaultPassword },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-cyber-surface border border-white/5">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-white font-mono">{item.value}</p>
                  </div>
                  <button onClick={() => copyText(item.value)} className="text-gray-500 hover:text-cyber-green transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-xs text-cyber-cyan mb-6">
              💡 Now issue a credential using Student ID <strong>{success.student.studentId}</strong> — it will appear in their portal.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSuccess(null); setForm({ name: '', studentId: '', email: '', phone: '', password: 'password' }); }}
                className="flex-1 btn-outline py-2.5 text-sm"
              >
                Register Another
              </button>
              <button
                onClick={() => navigate('/institution/issue')}
                className="flex-1 btn-cyan py-2.5 text-sm"
              >
                Issue Credential →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <div className="section-label mb-1">Institution Portal</div>
          <h1 className="text-3xl font-black text-white">Register Student</h1>
          <p className="text-gray-500 text-sm mt-1">Create a student login account. They can then view their credentials after you issue them.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-white/5"
        >
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 tracking-wider">STUDENT FULL NAME *</label>
                <input
                  className="cyber-input w-full"
                  placeholder="e.g. Rahul Verma"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 tracking-wider">STUDENT ID *</label>
                <input
                  className="cyber-input w-full"
                  placeholder="e.g. 22CS010"
                  value={form.studentId}
                  onChange={e => set('studentId', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 tracking-wider">PHONE</label>
                <input
                  className="cyber-input w-full"
                  placeholder="+91-9000000000"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 tracking-wider">LOGIN EMAIL *</label>
                <input
                  className="cyber-input w-full"
                  type="email"
                  placeholder="e.g. rahul.verma@student.nitrkl.ac.in"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5 tracking-wider">LOGIN PASSWORD</label>
                <div className="relative">
                  <input
                    className="cyber-input w-full pr-10"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Default: password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">Leave as "password" for the default. Student can use this to log in.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-cyan py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {loading ? 'Registering...' : 'Register Student'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
