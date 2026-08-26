import React, { useState, useMemo } from 'react';
import type { Equipment, User } from '../types';
import api from '../services/api';
import { X, Calendar, DollarSign, Info, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BookingModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onViewUser?: (user: User, title?: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onSuccess,
  onOpenAuth,
  onViewUser,
}) => {
  const { user } = useAuth();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff + 1;
  }, [startDate, endDate]);

  const totalAmount = useMemo(() => {
    if (!equipment || days <= 0) return 0;
    return equipment.pricePerDay * days;
  }, [equipment, days]);

  if (!isOpen || !equipment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      onOpenAuth('login');
      return;
    }

    if (days <= 0) {
      setError('End date must be on or after start date.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.post('/booking', {
        equipmentId: equipment._id,
        startDate,
        endDate,
      });
      onSuccess(`Booking confirmed for ${equipment.equipmentName}! The owner will review your request.`);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(axiosErr.response?.data?.message || axiosErr.message || 'Failed to submit booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        
        {/* Header */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Reserve Equipment</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Choose rental dates and confirm request</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          
          {/* Equipment Snapshot Card */}
          <div style={{
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-main)' }}>{equipment.equipmentName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Category: {equipment.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Rate</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{equipment.pricePerDay.toLocaleString('en-IN')}<span style={{ fontSize: 12, fontWeight: 500 }}>/day</span>
                </div>
              </div>
            </div>

            {equipment.ownerId && typeof equipment.ownerId === 'object' && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  <UserIcon size={14} color="var(--primary)" />
                  <span>Owner: <strong style={{ color: 'var(--text-main)' }}>{(equipment.ownerId as User).name}</strong></span>
                </div>
                {onViewUser && (
                  <button
                    type="button"
                    onClick={() => onViewUser(equipment.ownerId as User, 'Equipment Owner Profile & Contact')}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border-light)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--blue)',
                      cursor: 'pointer',
                    }}
                  >
                    View Contact Details ↗
                  </button>
                )}
              </div>
            )}
          </div>

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

          {/* Date Range Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Start Date</label>
              <input
                type="date"
                required
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">End Date</label>
              <input
                type="date"
                required
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Price Breakdown */}
          {days > 0 && (
            <div style={{
              border: '1.5px dashed #C8D6C8',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              backgroundColor: 'var(--primary-soft)',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                <span>Rental Duration</span>
                <strong style={{ color: 'var(--text-main)' }}>{days} Day{days > 1 ? 's' : ''}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                <span>Daily Rate</span>
                <span style={{ color: 'var(--text-main)' }}>₹{equipment.pricePerDay.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ borderTop: '1px solid #D0DDD0', margin: '8px 0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>Total Estimated Amount</span>
                <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Notice Note */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            backgroundColor: '#F8FAF8',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            marginBottom: 24,
          }}>
            <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              Your reservation request will be sent to the equipment owner. You will receive real-time updates under your <strong>My Bookings</strong> tab.
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || days <= 0}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15 }}
          >
            {loading ? 'Submitting Request...' : !user ? 'Sign In to Confirm Booking' : `Confirm Reservation • ₹${totalAmount.toLocaleString('en-IN')}`}
          </button>
        </form>

      </div>
    </div>
  );
};
