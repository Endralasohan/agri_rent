import React, { useState } from 'react';
import type { User } from '../types';
import { X, Phone, Mail, ShieldCheck, User as UserIcon, Calendar, Check, Copy, MessageSquare } from 'lucide-react';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  title,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen || !user) return null;

  const handleCopyPhone = () => {
    if (user.phone) {
      navigator.clipboard.writeText(user.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleCopyEmail = () => {
    if (user.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const isFarmer = user.role === 'farmer';
  const isOwner = user.role === 'owner';

  const roleTheme = isFarmer
    ? {
        label: 'Verified Farmer',
        icon: '👨‍🌾',
        color: '#1E8449',
        bg: '#E8F5E9',
        border: '#C8E6C9',
      }
    : isOwner
    ? {
        label: 'Verified Equipment Owner',
        icon: '🏭',
        color: '#2471A3',
        bg: '#EBF5FB',
        border: '#AED6F1',
      }
    : {
        label: 'Platform Administrator',
        icon: '⚙️',
        color: '#D4A017',
        bg: '#FEF9EE',
        border: '#F9E79F',
      };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, overflow: 'hidden' }}
      >
        {/* Decorative Top Accent Banner */}
        <div style={{
          height: 80,
          background: isFarmer
            ? 'linear-gradient(135deg, #1B4D2E 0%, #388E3C 100%)'
            : isOwner
            ? 'linear-gradient(135deg, #1B4F72 0%, #2980B9 100%)'
            : 'linear-gradient(135deg, #7D6608 0%, #D4AC0D 100%)',
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '14px 16px',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(4px)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '0 24px 28px', marginTop: -40 }}>
          
          {/* Avatar and Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '4px solid #FFFFFF',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 900,
              color: roleTheme.color,
              background: roleTheme.bg,
              marginBottom: 12,
            }}>
              {user.name ? user.name[0]?.toUpperCase() : 'U'}
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 4 }}>
              {user.name || 'User Profile'}
            </h3>

            {/* Role Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: roleTheme.bg,
              border: `1px solid ${roleTheme.border}`,
              color: roleTheme.color,
              fontSize: 12,
              fontWeight: 700,
            }}>
              <ShieldCheck size={14} />
              <span>{roleTheme.label}</span>
            </div>
          </div>

          {/* Section Title */}
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 12,
          }}>
            {title || (isFarmer ? 'Farmer Contact & Details' : 'Owner Contact & Details')}
          </div>

          {/* Contact Details Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            
            {/* Phone Number */}
            <div style={{
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#FFFFFF',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Phone Number</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                    {user.phone || 'Not provided'}
                  </div>
                </div>
              </div>

              {user.phone && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCopyPhone}
                    className="btn btn-secondary"
                    title="Copy phone"
                    style={{ padding: '6px 10px', fontSize: 12 }}
                  >
                    {copiedPhone ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`https://wa.me/91${user.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${user.name}, contacting you regarding AgriRent equipment.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: 12, color: '#1B5E20', backgroundColor: '#E8F8EE', border: '1px solid #C8E6C9' }}
                    title="Chat on WhatsApp"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${user.phone}`}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    Call
                  </a>
                </div>
              )}
            </div>

            {/* Email Address */}
            {user.email ? (
              <div style={{
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--border-light)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#FFFFFF',
                    color: 'var(--blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    flexShrink: 0,
                  }}>
                    <Mail size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={handleCopyEmail}
                    className="btn btn-secondary"
                    title="Copy email"
                    style={{ padding: '6px 10px', fontSize: 12 }}
                  >
                    {copiedEmail ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`mailto:${user.email}`}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    Email
                  </a>
                </div>
              </div>
            ) : null}

            {/* Member Since / Registration Note */}
            {user.createdAt && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--text-muted)',
                padding: '4px 8px',
              }}>
                <Calendar size={14} />
                <span>
                  Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}

          </div>

          {/* Quick Action Button */}
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: 14 }}
          >
            Close Details
          </button>

        </div>
      </div>
    </div>
  );
};
