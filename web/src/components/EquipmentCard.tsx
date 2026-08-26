import React from 'react';
import type { Equipment, User } from '../types';
import { Calendar, User as UserIcon, CheckCircle2, XCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EquipmentCardProps {
  item: Equipment;
  onBook: (equipment: Equipment) => void;
  onEdit?: (equipment: Equipment) => void;
  onToggleStatus?: (equipment: Equipment) => void;
  onDelete?: (equipmentId: string) => void;
  onViewUser?: (user: User, title?: string) => void;
}

const CATEGORY_META: Record<string, { icon: string; bg: string; color: string }> = {
  Tractor: { icon: '🚜', bg: '#E8F2EA', color: '#1E8449' },
  Seeder: { icon: '🌱', bg: '#E6F4EA', color: '#27AE60' },
  Harvester: { icon: '🌾', bg: '#FEF9EE', color: '#D4A017' },
  Rotavator: { icon: '⚙️', bg: '#FEF0E6', color: '#E07B39' },
  Sprayer: { icon: '💧', bg: '#EBF5FB', color: '#2980B9' },
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  item,
  onBook,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewUser,
}) => {
  const { user } = useAuth();
  const meta = CATEGORY_META[item.category] || { icon: '🔧', bg: '#F0F4F0', color: '#1E8449' };

  const ownerObj = typeof item.ownerId === 'object' ? (item.ownerId as User) : null;
  const isOwner = user && (user.role === 'admin' || (ownerObj && ownerObj._id === user._id) || (typeof item.ownerId === 'string' && item.ownerId === user._id));

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--transition-normal)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Thumbnail Banner */}
      <div style={{
        height: 140,
        backgroundColor: meta.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
      }}>
        <div style={{ fontSize: 56, transform: 'scale(1.1)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))' }}>
          {meta.icon}
        </div>

        {/* Availability Badge */}
        <div style={{
          position: 'absolute',
          top: 14,
          right: 14,
        }}>
          {item.available ? (
            <span className="badge badge-available">
              <CheckCircle2 size={12} /> Available
            </span>
          ) : (
            <span className="badge badge-unavailable">
              <XCircle size={12} /> Unavailable
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 14,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: 11,
          fontWeight: 700,
          color: meta.color,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}>
          {meta.icon} {item.category}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
          <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
            {item.equipmentName}
          </h4>
        </div>

        <p style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: 16,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 38,
        }}>
          {item.description}
        </p>

        {/* Owner Info */}
        {ownerObj && (
          <div style={{ marginBottom: 14 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onViewUser) {
                  onViewUser(ownerObj, 'Equipment Owner Profile & Contact');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--blue)',
                backgroundColor: 'var(--blue-soft)',
                border: '1px solid #D5E2F3',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'var(--transition-fast)',
              }}
              title="Click to view Owner contact & profile details"
            >
              <UserIcon size={13} />
              <span>Owner: <strong style={{ color: 'var(--text-main)' }}>{ownerObj.name}</strong></span>
              <span style={{ fontSize: 10, opacity: 0.8, textDecoration: 'underline' }}>View Profile ↗</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Daily Rate</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
              ₹{item.pricePerDay.toLocaleString('en-IN')}
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}> /day</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {isOwner && onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="btn btn-secondary"
                title="Edit listing"
                style={{ padding: '8px 12px' }}
              >
                <Edit size={15} />
              </button>
            )}

            {isOwner && onToggleStatus && (
              <button
                onClick={() => onToggleStatus(item)}
                className="btn btn-secondary"
                title={item.available ? "Mark as Unavailable" : "Mark as Available"}
                style={{ padding: '8px 12px', color: item.available ? 'var(--danger)' : 'var(--primary)' }}
              >
                {item.available ? 'Pause' : 'Activate'}
              </button>
            )}

            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(item._id)}
                className="btn btn-danger"
                title="Delete listing"
                style={{ padding: '8px 12px' }}
              >
                <Trash2 size={15} />
              </button>
            )}

            {(!isOwner || user?.role === 'admin') && (
              <button
                onClick={() => onBook(item)}
                disabled={!item.available}
                className="btn btn-primary"
                style={{ padding: '9px 18px', fontSize: 13 }}
              >
                <Calendar size={15} />
                <span>{item.available ? 'Book Now' : 'Unavailable'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
