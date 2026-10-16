'use client';

import { useState, useRef } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/auth/send-otp', formData);
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/auth/verify-otp', { email: formData.email, otp: otp.join('') });
      toast.success('Account created! Please login.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '13px', color: '#111827',
    background: '#fff', boxSizing: 'border-box' as const,
    outline: 'none', fontFamily: 'Inter, DM Sans, sans-serif',
    transition: 'border-color 0.15s',
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

      <div style={{ display: 'flex', width: '100%', maxWidth: '880px', minHeight: '580px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', margin: '20px' }}>

        {/* Left Panel */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: '-80px', right: '-80px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: '40px', left: '-60px', pointerEvents: 'none' }} />

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
              Inventory,<br />intelligently<br />managed.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Real-time stock tracking, AI-powered<br />insights, and seamless operations.
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

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
            {[0, 1].map(i => (
              <div key={i} style={{
                height: '4px', borderRadius: '2px', flex: 1,
                background: (step === 'form' && i === 0) || (step === 'otp') ? '#6366f1' : '#e5e7eb',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSendOtp}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '22px', color: '#111827', margin: '0 0 4px' }}>Create account</h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 24px' }}>Join CoreInventory — takes 30 seconds.</p>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Full Name</label>
                <input className="ci-input" type="text" required placeholder="Alex Johnson"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Email Address</label>
                <input className="ci-input" type="email" required placeholder="alex@company.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Password</label>
                <input className="ci-input" type="password" required placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={inputStyle} />
              </div>

              {/* Role — no emojis */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Role</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['STAFF', 'MANAGER'].map(role => (
                    <button key={role} type="button" onClick={() => setFormData({ ...formData, role })}
                      style={{
                        flex: 1, padding: '10px', border: '2px solid',
                        borderColor: formData.role === role ? '#6366f1' : '#e5e7eb',
                        borderRadius: '8px', background: formData.role === role ? '#eef2ff' : '#fff',
                        color: formData.role === role ? '#4f46e5' : '#6b7280',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s', fontFamily: 'Inter, DM Sans, sans-serif',
                      }}>
                      {role === 'STAFF' ? 'Staff' : 'Manager'}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '6px 0 0' }}>
                  {formData.role === 'MANAGER'
                    ? 'Managers can validate operations and manage all records.'
                    : 'Staff can view and create records but cannot validate operations.'}
                </p>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '10px', color: loading ? '#9ca3af' : '#fff',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Sending OTP...' : 'Send verification code'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
                Already have an account?{' '}
                <a href="/auth/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '22px', color: '#111827', margin: '0 0 4px' }}>Check your email</h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 4px' }}>We sent a 6-digit code to</p>
              <p style={{ color: '#6366f1', fontSize: '13px', fontWeight: 600, margin: '0 0 24px' }}>{formData.email}</p>

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

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '10px', color: loading ? '#9ca3af' : '#fff',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Verifying...' : 'Verify and create account'}
              </button>

              <button type="button" onClick={() => setStep('form')} style={{
                width: '100%', padding: '11px', marginTop: '8px',
                background: 'transparent', border: '1px solid #e5e7eb',
                borderRadius: '10px', color: '#9ca3af', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'Inter, DM Sans, sans-serif',
              }}>Back</button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
                Didn't receive it?{' '}
                <span onClick={handleSendOtp as any} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Resend code</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}