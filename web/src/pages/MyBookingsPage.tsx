import React, { useEffect, useState, useMemo } from 'react';
import type { Booking, Equipment, User } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, User as UserIcon } from 'lucide-react';

interface MyBookingsPageProps {
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onBrowse: () => void;
  onViewUser: (user: User, title?: string) => void;
}

type FilterKey = 'All' | 'Pending' | 'Approved' | 'Completed' | 'Cancelled';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending: <Clock size={14} />,
  Approved: <CheckCircle2 size={14} />,
  Completed: <CheckCircle2 size={14} />,
  Cancelled: <XCircle size={14} />,
};

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ showToast, onBrowse, onViewUser }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ bookings: Booking[] }>('/booking/my-bookings');
      setBookings(data.bookings || []);
    } catch {
      showToast('error', 'Could not load bookings', 'Please make sure you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: Booking['status']) => {
    setActionLoadingId(bookingId);
    try {
      const { data } = await api.patch<{ booking: Booking }>(`/booking/${bookingId}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? data.booking : b))
      );
      showToast('success', 'Status Updated', `Booking status changed to ${status}.`);
    } catch {
      showToast('error', 'Update Failed', 'Could not update booking status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setActionLoadingId(bookingId);
    try {
      const { data } = await api.patch<{ booking: Booking }>(`/booking/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? data.booking : b))
      );
      showToast('info', 'Booking Cancelled', 'Your booking request has been cancelled.');
    } catch {
      showToast('error', 'Cancellation Failed', 'Could not cancel booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';
  const isFarmer = user?.role === 'farmer';

  const filteredBookings = useMemo(() => {
    if (activeFilter === 'All') return bookings;
    return bookings.filter((b) => b.status === activeFilter);
  }, [bookings, activeFilter]);

  const counts = useMemo(() => {
    const res: Record<string, number> = { All: bookings.length, Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 };
    bookings.forEach((b) => {
      if (res[b.status] !== undefined) res[b.status]++;
    });
    return res;
  }, [bookings]);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
              {isOwnerOrAdmin ? 'Rental Reservations & Bookings' : 'My Equipment Bookings'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {isOwnerOrAdmin
                ? 'Manage reservations received for your machinery and equipment'
                : 'Track the confirmation and rental dates of your booked farm machinery'}
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 24,
        }}>
          {(['All', 'Pending', 'Approved', 'Completed', 'Cancelled'] as FilterKey[]).map((tab) => {
            const isSelected = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                  backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <span>{tab}</span>
                <span style={{
                  fontSize: 11,
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-muted)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontWeight: 800,
                }}>
                  {counts[tab] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 130, backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }} />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '64px 20px',
            textAlign: 'center',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📋</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>No Bookings Found</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 20px' }}>
              {isFarmer
                ? 'You do not have any bookings under this filter yet. Browse equipment to make a reservation.'
                : 'No incoming booking requests found under this status filter.'}
            </p>
            {isFarmer && (
              <button onClick={onBrowse} className="btn btn-primary">
                Browse Equipment Catalog →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredBookings.map((b) => {
              const eq = typeof b.equipmentId === 'object' ? (b.equipmentId as Equipment) : null;
              const farmer = typeof b.farmerId === 'object' ? (b.farmerId as User) : null;
              const isActionLoading = actionLoadingId === b._id;

              const badgeClass =
                b.status === 'Pending'
                  ? 'badge-pending'
                  : b.status === 'Approved'
                  ? 'badge-approved'
                  : b.status === 'Completed'
                  ? 'badge-completed'
                  : 'badge-cancelled';

              const owner = eq && typeof eq.ownerId === 'object' ? (eq.ownerId as User) : null;

              return (
                <div
                  key={b._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '20px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20,
                  }}
                >
                  
                  {/* Equipment & User Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 260 }}>
                    <div style={{
                      width: 54,
                      height: 54,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      flexShrink: 0,
                    }}>
                      🚜
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                          {eq?.equipmentName || 'Farming Equipment'}
                        </h4>
                        <span className={`badge ${badgeClass}`}>
                          {STATUS_ICONS[b.status]} {b.status}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                        {eq?.category && (
                          <span style={{ backgroundColor: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                            Category: {eq.category}
                          </span>
                        )}

                        {/* Owner Details Button */}
                        {owner && (
                          <button
                            type="button"
                            onClick={() => onViewUser(owner, 'Equipment Owner Profile & Contact')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              backgroundColor: 'var(--blue-soft)',
                              border: '1px solid var(--border-light)',
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'var(--blue)',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)',
                            }}
                            title="Click to view Owner contact & profile details"
                          >
                            <UserIcon size={13} />
                            <span>Owner: <strong>{owner.name}</strong></span>
                            <span style={{ fontSize: 10, opacity: 0.85, textDecoration: 'underline' }}>View Profile ↗</span>
                          </button>
                        )}

                        {/* Farmer Details Button */}
                        {farmer && (
                          <button
                            type="button"
                            onClick={() => onViewUser(farmer, 'Farmer Profile & Contact')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              backgroundColor: 'var(--primary-soft)',
                              border: '1px solid var(--border-light)',
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)',
                            }}
                            title="Click to view Farmer contact & profile details"
                          >
                            <UserIcon size={13} />
                            <span>Farmer: <strong>{farmer.name}</strong></span>
                            <span style={{ fontSize: 10, opacity: 0.85, textDecoration: 'underline' }}>View Profile ↗</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates & Total Amount */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rental Period</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Calendar size={15} color="var(--primary)" />
                        <span>{new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span style={{ color: 'var(--text-light)' }}>→</span>
                        <span>{new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isOwnerOrAdmin && b.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'Approved')}
                        disabled={isActionLoading}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: 13 }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Approve</span>
                      </button>
                    )}

                    {isOwnerOrAdmin && b.status === 'Approved' && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'Completed')}
                        disabled={isActionLoading}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: 13, background: 'var(--blue)' }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                      <button
                        onClick={() => (isOwnerOrAdmin ? handleUpdateStatus(b._id, 'Cancelled') : handleCancelBooking(b._id))}
                        disabled={isActionLoading}
                        className="btn btn-danger"
                        style={{ padding: '8px 14px', fontSize: 13 }}
                      >
                        <XCircle size={15} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
