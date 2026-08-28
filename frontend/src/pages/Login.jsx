import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const demoAccounts = [
  { role: 'Institution', email: 'registrar@nitrkl.ac.in', password: 'password', icon: '🏛️', color: 'cyan' },
  { role: 'Student', email: 'arjun.sharma@student.nitrkl.ac.in', password: 'password', icon: '🎓', color: 'green' },
  { role: 'Employer', email: 'hr@techcorp.in', password: 'password', icon: '🏢', color: 'purple' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'institution') navigate('/institution');
      else if (user.role === 'student') navigate('/student');
      else if (user.role === 'employer') navigate('/employer');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex items-center justify-center p-6">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-cyan/3 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-cyber-cyan" />
            </div>
            <span className="font-black text-2xl tracking-wider">
              BLOCK<span className="text-cyber-cyan">CRED</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Secure Access</h1>
          <p className="text-gray-500 text-sm">Sign in to your portal</p>
        </div>

        {/* Demo accounts */}
        <div className="glass-card p-4 mb-5 border border-white/5">
          <p className="text-xs text-gray-500 mb-3 text-center tracking-wider">DEMO ACCOUNTS (click to fill)</p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc)}
                className={`p-3 rounded-lg border text-center transition-all hover:scale-105 ${
                  acc.color === 'cyan' ? 'border-cyber-cyan/30 bg-cyber-cyan/5 hover:bg-cyber-cyan/10' :
                  acc.color === 'green' ? 'border-cyber-green/30 bg-cyber-green/5 hover:bg-cyber-green/10' :
                  'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10'
                }`}
              >
                <div className="text-lg mb-1">{acc.icon}</div>
                <div className={`text-xs font-semibold ${
                  acc.color === 'cyan' ? 'text-cyber-cyan' :
                  acc.color === 'green' ? 'text-cyber-green' : 'text-purple-400'
                }`}>{acc.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="glass-card p-7 border border-cyber-border">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium tracking-wider">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  className="cyber-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium tracking-wider">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cyber-input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">Demo password: <code className="text-cyber-green">password</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyan w-full flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cyber-bg/40 border-t-cyber-bg rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>Sign In <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              Want to verify a credential?{' '}
              <Link to="/employer" className="text-cyber-cyan hover:underline">
                Public Verification Portal
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
