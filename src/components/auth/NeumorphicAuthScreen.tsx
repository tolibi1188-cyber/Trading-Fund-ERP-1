/**
 * Premium 3D Flip Neumorphic Circular Login & Sign Up Screen
 * Pixel-perfect implementation of circular neumorphic perspective card with 180deg flip,
 * tactile embossed inputs, glowing focus rings, sweep sheen animation, and role authentication.
 */

import React, { useState } from 'react';
import { User, Lock, Mail, ShieldCheck, Sun, Moon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useErp } from '../../context/ErpContext';

interface NeumorphicAuthScreenProps {
  onSuccessLogin?: (role: 'admin' | 'investor') => void;
}

export const NeumorphicAuthScreen: React.FC<NeumorphicAuthScreenProps> = ({ onSuccessLogin }) => {
  const { setActiveTabMode, erpTheme, toggleErpTheme } = useErp();
  const isDarkMode = erpTheme === 'dark';

  // Flip 3D state
  const [isFlipped, setIsFlipped] = useState(false);

  // Switch states
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Status feedback
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Handle Login
  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Determine target role based on username or selection
    const isInvestor = loginUsername.toLowerCase().includes('invest') || loginUsername.toLowerCase().includes('user');
    const targetRole = isInvestor ? 'investor' : 'admin';

    setStatusMsg(`Kirish muvaffaqiyatli: ${targetRole === 'admin' ? 'Admin ERP' : 'Investor Kabineti'}`);

    setTimeout(() => {
      if (targetRole === 'investor') {
        setActiveTabMode('mobile');
      } else {
        setActiveTabMode('admin');
      }
      if (onSuccessLogin) onSuccessLogin(targetRole);
    }, 450);
  };

  // Handle Sign Up
  const handleSignupSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMsg("Hisob muvaffaqiyatli yaratildi! Kirish oynasiga o'tilmoqda...");
    setTimeout(() => {
      setIsFlipped(false);
      setStatusMsg(null);
    }, 1200);
  };

  // Quick fill helper
  const handleQuickFill = (role: 'admin' | 'investor') => {
    if (role === 'admin') {
      setLoginUsername('admin');
      setLoginPassword('admin2026');
    } else {
      setLoginUsername('investor');
      setLoginPassword('investor2026');
    }
  };

  return (
    <div className={`login-wrapper ${isDarkMode ? 'theme-dark' : ''}`}>
      {/* Top Floating Controls: Dark/Light Mode & Quick Role Selector */}
      <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20 pointer-events-auto">
        {/* Brand Badge */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-md bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/20">
            TF
          </div>
          <span className="font-semibold text-xs tracking-wider uppercase opacity-70" style={{ color: isDarkMode ? '#cbd5e1' : '#4a4a4a' }}>
            Trading Fund ERP
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Demo Fill Buttons */}
          <div className="hidden sm:flex items-center space-x-1.5 p-1 rounded-xl shadow-inner text-[11px] font-medium"
               style={{ background: isDarkMode ? '#0a0d14' : '#dedede' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                loginUsername === 'admin' 
                  ? 'bg-orange-500 text-white font-semibold shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('investor')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                loginUsername === 'investor' 
                  ? 'bg-orange-500 text-white font-semibold shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Investor Demo
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleErpTheme}
            title={isDarkMode ? "Klassik oqimtir Neumorphic rejimiga o'tish" : "Tungi qora Neumorphic rejimiga o'tish"}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95"
            style={{
              background: isDarkMode ? '#131924' : '#e8e8e8',
              boxShadow: isDarkMode 
                ? '4px 4px 8px #080c13, -3px -3px 8px rgba(255,255,255,0.05)' 
                : '-4px -4px 8px #ffffff, 4px 4px 8px #c5c5c5',
              color: isDarkMode ? '#f59e0b' : '#64748b'
            }}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Status Alert Toast */}
      {statusMsg && (
        <div className="absolute top-16 z-30 px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 animate-in fade-in slide-in-from-top-3 shadow-lg bg-emerald-600 text-white">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3D FLIP PERSPECTIVE SCENE                                          */}
      {/* =================================================================== */}
      <div className={`flip-scene ${isFlipped ? 'flipped' : ''}`} id="flipScene">
        <div className="flip-card">

          {/* =============================================================== */}
          {/* FRONT FACE — LOGIN                                             */}
          {/* =============================================================== */}
          <div className="glass-circle front">
            <div className="accent-ring"></div>

            <form className="login-form" onSubmit={handleLoginSubmit}>
              <h1>Login</h1>
              <div className="subtitle">Sign in to your account</div>

              {/* Username Input Box */}
              <div className="input-box">
                <i className="fa-solid fa-user">
                  <User className="w-4 h-4 inline-block -mt-1" />
                </i>
                <input
                  type="text"
                  placeholder="Username"
                  autoComplete="off"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password Input Box */}
              <div className="input-box">
                <i className="fa-solid fa-lock">
                  <Lock className="w-4 h-4 inline-block -mt-1" />
                </i>
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="off"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="forgot">
                <div 
                  className="remember cursor-pointer select-none"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <div className={`switch ${rememberMe ? 'on' : ''}`} id="rememberSwitch"></div>
                  Remember me
                </div>
                <a 
                  href="#forgot" 
                  onClick={(e) => {
                    e.preventDefault();
                    setStatusMsg("Parolni tiklash: Administrator bilan bog'laning: tolibi1188@gmail.com");
                    setTimeout(() => setStatusMsg(null), 4000);
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button with sheen sweep */}
              <button type="submit">Sign In</button>

              {/* Flip link to Sign Up */}
              <div className="signup-text">
                Don't have an account?{' '}
                <a 
                  id="toSignup" 
                  onClick={() => setIsFlipped(true)}
                >
                  Sign up
                </a>
              </div>

              {/* Direct Bypass Button for quick testing */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => handleLoginSubmit()}
                  className="!w-auto !h-auto !py-1 !px-3 !bg-transparent !shadow-none !border-none !text-[11px] !font-normal !lowercase !tracking-normal hover:!underline opacity-60 hover:opacity-100 flex items-center justify-center space-x-1 mx-auto"
                  style={{ color: isDarkMode ? '#94a3b8' : '#737373' }}
                >
                  <span>to'g'ridan-to'g'ri o'tish (demo)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>

          {/* =============================================================== */}
          {/* BACK FACE — SIGN UP                                            */}
          {/* =============================================================== */}
          <div className="glass-circle back">
            <div className="accent-ring"></div>

            <form className="login-form" onSubmit={handleSignupSubmit}>
              <h1>Sign Up</h1>
              <div className="subtitle">Create your account</div>

              {/* Full Name Input Box */}
              <div className="input-box">
                <i className="fa-solid fa-user">
                  <User className="w-4 h-4 inline-block -mt-1" />
                </i>
                <input
                  type="text"
                  placeholder="Full name"
                  autoComplete="off"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>

              {/* Email Input Box */}
              <div className="input-box">
                <i className="fa-solid fa-envelope">
                  <Mail className="w-4 h-4 inline-block -mt-1" />
                </i>
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="off"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input Box */}
              <div className="input-box" style={{ marginBottom: '24px' }}>
                <i className="fa-solid fa-lock">
                  <Lock className="w-4 h-4 inline-block -mt-1" />
                </i>
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="off"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>

              {/* Create Account Button */}
              <button type="submit">Create Account</button>

              {/* Flip link to Login */}
              <div className="signup-text">
                Already have an account?{' '}
                <a 
                  id="toLogin" 
                  onClick={() => setIsFlipped(false)}
                >
                  Login
                </a>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-4 inset-x-0 text-center text-[11px] opacity-40 select-none font-mono"
           style={{ color: isDarkMode ? '#94a3b8' : '#737373' }}>
        Trading Fund ERP • 3D Neumorphic Secure Gate
      </div>
    </div>
  );
};
