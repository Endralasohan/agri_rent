import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Tractor, PlusCircle, Shield, LogOut, Calendar, Compass } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  currentTab: 'home' | 'bookings' | 'admin' | 'profile';
  onNavigate: (tab: 'home' | 'bookings' | 'admin' | 'profile') => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAddEquipment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenAuth,
  onOpenAddEquipment,
}) => {
  const { user, logout } = useAuth();

  const isOwner = user?.role === 'owner' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="glass-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
        >
          <Logo size="sm" />
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: currentTab === 'home' ? 'var(--primary-soft)' : 'transparent',
              color: currentTab === 'home' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <Compass size={18} />
            <span>Browse Catalog</span>
          </button>

          {user && (
            <button
              onClick={() => onNavigate('bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: currentTab === 'bookings' ? 'var(--primary-soft)' : 'transparent',
                color: currentTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              <Calendar size={18} />
              <span>My Bookings</span>
            </button>
          )}

          {isOwner && (
            <button
              onClick={onOpenAddEquipment}
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: 13, marginLeft: 4 }}
            >
              <PlusCircle size={16} />
              <span>Add Equipment</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: currentTab === 'admin' ? 'var(--amber-soft)' : 'transparent',
                color: currentTab === 'admin' ? 'var(--amber)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              <Shield size={18} />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* User Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => onNavigate('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: currentTab === 'profile' ? 'var(--primary-soft)' : '#FFFFFF',
                  border: '1.5px solid var(--border-light)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: user.role === 'farmer' ? 'var(--primary)' : user.role === 'owner' ? 'var(--blue)' : 'var(--amber)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                }}>
                  {user.name[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>{user.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
              </button>

              <button
                onClick={logout}
                title="Logout"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1.5px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                Join AgriRent
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
