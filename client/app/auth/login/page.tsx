'use client';

import { useState, useRef } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Step = 'login' | 'forgot-email' | 'forgot-otp';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP helpers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password – send OTP
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Enter your email');
    setLoading(true);
    try {
      await axios.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('OTP sent to your email');
      setOtp(['', '', '', '', '', '']);
      setStep('forgot-otp');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password – verify OTP + set new password
  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await axios.post('/auth/reset-password', { email: forgotEmail, otp: otp.join(''), newPassword });
      toast.success('Password reset! Please sign in.');
      setStep('login');
      setForgotEmail('');
      setNewPassword('');
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '13px', color: '#111827', background: '#fff',
    boxSizing: 'border-box' as const, outline: 'none',
    fontFamily: 'Inter, DM Sans, sans-serif', transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: '#6b7280', textTransform: 'uppercase' as const,
    letterSpacing: '0.5px', marginBottom: '6px',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc', fontFamily: 'Inter, DM Sans, sans-serif' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ci-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .otp-box:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse { animation: pulse 2s infinite; }
      `}</style>

      <div style={{ display: 'flex', width: '100%', maxWidth: '880px', minHeight: '540px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', margin: '20px' }}>

        {/* Left Panel */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: '-80px', right: '-80px', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2 }}>
            <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
                <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
                <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.3"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff' }}>CoreInventory</span>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '4px 12px', marginBottom: '20px' }}>
              <span className="pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a7f3d0', display: 'inline-block' }} />
              <span style={{ color: '#fff', fontSize: '11px', opacity: 0.9 }}>Odoo Hackathon 2024</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '34px', color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 12px' }}>
              {step === 'login' ? <>Welcome<br />back.</> : <>Reset your<br />password.</>}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              {step === 'login' ? <>Your inventory is waiting.<br />Sign in to continue.</> : <>We will send a one-time code<br />to verify your identity.</>}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 2 }}>
            {[['20+', 'Products'], ['3', 'Warehouses'], ['AI', 'Chatbot']].map(([num, label]) => (
              <div key={label} style={{ borderLeft: '2px solid rgba(255,255,255,0.3)', paddingLeft: '12px' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff' }}>{num}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: '400px', background: '#fff', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* ── LOGIN ── */}
          {step === 'login' && (
            <>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '22px', color: '#111827', margin: '0 0 4px' }}>Sign in</h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 28px' }}>Enter your credentials to continue.</p>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input className="ci-input" type="email" required placeholder="alex@company.com"
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <label style={labelStyle}>Password</label>
                  <input className="ci-input" type="password" required placeholder="••••••••"
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                    style={inputStyle} />
                </div>

                {/* Forgot password link */}
                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                  <span
                    onClick={() => { setForgotEmail(formData.email); setStep('forgot-email'); }}
                    style={{ fontSize: '12px', color: '#6366f1', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Forgot password?
                  </span>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px',
                  background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '10px',
                  color: loading ? '#9ca3af' : '#fff',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
                  Don't have an account?{' '}
                  <a href="/auth/signup" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Create one</a>
                </p>
              </form>
            </>
          )}

          {/* ── FORGOT — ENTER EMAIL ── */}
          {step === 'forgot-email' && (
            <>
              <button onClick={() => setStep('login')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', padding: 0, textAlign: 'left', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ← Back to sign in
              </button>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '22px', color: '#111827', margin: '0 0 4px' }}>Forgot password</h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 28px' }}>Enter your registered email and we will send a reset code.</p>

              <form onSubmit={handleForgotSendOtp}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input className="ci-input" type="email" required placeholder="alex@company.com"
                    value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                    style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px',
                  background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '10px',
                  color: loading ? '#9ca3af' : '#fff',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>
              </form>
            </>
          )}

          {/* ── FORGOT — ENTER OTP + NEW PASSWORD ── */}
          {step === 'forgot-otp' && (
            <>
              <button onClick={() => setStep('forgot-email')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', padding: 0, textAlign: 'left', marginBottom: '20px' }}>
                ← Back
              </button>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '22px', color: '#111827', margin: '0 0 4px' }}>Check your email</h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 4px' }}>We sent a 6-digit code to</p>
              <p style={{ color: '#6366f1', fontSize: '13px', fontWeight: 600, margin: '0 0 24px' }}>{forgotEmail}</p>

              <form onSubmit={handleForgotVerify}>
                {/* OTP boxes */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {otp.map((digit, i) => (
                    <input key={i} ref={el => { otpRefs.current[i] = el; }}
                      className="otp-box" type="text" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{ width: '44px', height: '52px', border: '2px solid #e5e7eb', borderRadius: '10px', color: '#111827', fontSize: '20px', fontFamily: 'Syne, sans-serif', fontWeight: 700, textAlign: 'center', boxSizing: 'border-box', outline: 'none', background: '#fff', flexShrink: 0 }}
                    />
                  ))}
                </div>

                {/* New password */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>New Password</label>
                  <input className="ci-input" type="password" required placeholder="Min. 6 characters"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    style={inputStyle} />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px',
                  background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '10px',
                  color: loading ? '#9ca3af' : '#fff',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '14px' }}>
                  Didn't receive it?{' '}
                  <span onClick={handleForgotSendOtp as any} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Resend code</span>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 