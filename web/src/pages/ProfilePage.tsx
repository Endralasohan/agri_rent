import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Lock, Shield, LogOut, CheckCircle2, Save } from 'lucide-react';

interface ProfilePageProps {
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ showToast }) => {
  const { user, updateProfile, logout } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      showToast('error', 'Password Mismatch', 'New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name,
        phone,
        password: password || undefined,
      });
      setPassword('');
      setConfirmPassword('');
      showToast('success', 'Profile Updated', 'Your profile details have been saved.');
    } catch {
      showToast('error', 'Update Failed', 'Could not update your account information.');
    } finally {
      setLoading(false);
    }
  };

  const roleMeta =
    user.role === 'farmer'
      ? { label: 'Farmer Account', color: 'var(--primary)', bg: 'var(--primary-soft)', icon: '👨‍🌾' }
      : user.role === 'owner'
      ? { label: 'Equipment Owner', color: 'var(--blue)', bg: 'var(--blue-soft)', icon: '🏭' }
      : { label: 'Administrator', color: 'var(--amber)', bg: 'var(--amber-soft)', icon: '⚙️' };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        
        {/* Profile Card Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 28,
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: roleMeta.color,
            color: '#FFFFFF',
            fontSize: 28,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
          }}>
            {user.name[0]?.toUpperCase() || 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900 }}>{user.name}</h2>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: roleMeta.bg,
                color: roleMeta.color,
                padding: '3px 12px',
                borderRadius: 'var(--radius-full)',
              }}>
                {roleMeta.icon} {roleMeta.label}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{user.email}</div>
          </div>

          <button onClick={logout} className="btn btn-danger" style={{ padding: '9px 16px', fontSize: 13 }}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Update Form */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Personal Information</h3>

          <form onSubmit={handleSubmit}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Name */}
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
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
                    className="input-field"
                    style={{ paddingLeft: 40 }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                </div>
              </div>
            </div>

            {/* Email (Read only) */}
            <div className="input-group">
              <label className="input-label">Registered Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  disabled
                  className="input-field"
                  style={{ paddingLeft: 40, backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}
                  value={user.email}
                />
                <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Account email cannot be modified directly.</span>
            </div>

            <div style={{ margin: '24px 0 16px', borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Change Password (Optional)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      className="input-field"
                      style={{ paddingLeft: 40 }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      className="input-field"
                      style={{ paddingLeft: 40 }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: 14 }}
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
