import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please fill in both email and password.');
        }
        await login({ email, password });
        onSuccess('Welcome back! You are now signed in.');
        onClose();
      } else {
        if (!name || !email || !phone || !password || !confirmPassword) {
          throw new Error('Please fill in all required fields.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await register({ name, email, phone, password, role });
        onSuccess('Account successfully created! Welcome to AgriRent.');
        onClose();
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(axiosErr.response?.data?.message || axiosErr.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px 16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Logo size="sm" />
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)' }}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {mode === 'login' ? 'Access your bookings & machinery' : 'Rent equipment or earn as an owner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', padding: '12px 28px 0', gap: 8 }}>
          <button
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderBottom: `2px solid ${mode === 'login' ? 'var(--primary)' : 'transparent'}`,
              background: 'transparent',
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderBottom: `2px solid ${mode === 'register' ? 'var(--primary)' : 'transparent'}`,
              background: 'transparent',
              color: mode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px' }}>
          
          {error && (
            <div style={{
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 16,
              border: '1px solid rgba(231, 76, 60, 0.2)',
            }}>
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div style={{ marginBottom: 16 }}>
                <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>I want to join as a:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div
                    onClick={() => setRole('farmer')}
                    style={{
                      border: `2px solid ${role === 'farmer' ? 'var(--primary)' : 'var(--border-light)'}`,
                      backgroundColor: role === 'farmer' ? 'var(--primary-soft)' : '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>👨‍🌾</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: role === 'farmer' ? 'var(--primary)' : 'var(--text-main)' }}>Farmer</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rent machinery</div>
                  </div>

                  <div
                    onClick={() => setRole('owner')}
                    style={{
                      border: `2px solid ${role === 'owner' ? 'var(--blue)' : 'var(--border-light)'}`,
                      backgroundColor: role === 'owner' ? 'var(--blue-soft)' : '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🏭</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: role === 'owner' ? 'var(--blue)' : 'var(--text-main)' }}>Equipment Owner</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>List & earn</div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className="input-field"
                    style={{ paddingLeft: 40 }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                </div>
              </div>

              {/* Phone */}
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    className="input-field"
                    style={{ paddingLeft: 40 }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="input-field"
                style={{ paddingLeft: 40 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                className="input-field"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat password"
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8, padding: '13px', fontSize: 15 }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Complete Registration →'}
          </button>
        </form>

      </div>
    </div>
  );
};
