import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const institutionLinks = [
  { path: '/institution', label: 'Dashboard' },
  { path: '/institution/register-student', label: 'Register Student' },
  { path: '/institution/issue', label: 'Issue Credential' },
  { path: '/institution/explorer', label: 'Block Explorer' },
];

const studentLinks = [
  { path: '/student', label: 'My Credentials' },
];

const employerLinks = [
  { path: '/employer', label: 'Verify Credential' },
];

const roleColors = {
  institution: { accent: 'text-cyber-cyan', border: 'border-cyber-cyan/30', dot: 'bg-cyber-cyan' },
  student: { accent: 'text-cyber-green', border: 'border-cyber-green/30', dot: 'bg-cyber-green' },
  employer: { accent: 'text-purple-400', border: 'border-purple-400/30', dot: 'bg-purple-400' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'institution' ? institutionLinks
    : user?.role === 'student' ? studentLinks
    : employerLinks;

  const colors = roleColors[user?.role] || roleColors.employer;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-cyber-bg/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center">
            <Lock className="w-4 h-4 text-cyber-cyan" />
          </div>
          <span className="font-black text-lg tracking-wider">
            BLOCK<span className="text-cyber-cyan">CRED</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? `${colors.accent} bg-cyber-surface border ${colors.border}`
                  : 'text-gray-400 hover:text-white hover:bg-cyber-surface'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User + Logout */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors.border} bg-cyber-surface`}>
              <span className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
              <span className="text-xs text-gray-300 font-medium">{user.name}</span>
              <span className={`text-xs ${colors.accent} capitalize font-semibold`}>{user.role}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 bg-cyber-surface"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-cyber-card hover:text-white"
                >
                  {link.label} <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

