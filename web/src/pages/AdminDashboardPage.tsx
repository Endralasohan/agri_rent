import React, { useEffect, useState } from 'react';
import type { AdminSummary, User, Equipment, Booking } from '../types';
import api from '../services/api';
import { registerKnownUsers } from '../services/userDirectory';
import { Users, Tractor, Calendar, Shield, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AdminDashboardPageProps {
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onViewUser?: (user: User, title?: string) => void;
}

type AdminTab = 'overview' | 'users' | 'equipment' | 'bookings';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ showToast, onViewUser }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [summary, setSummary] = useState<AdminSummary>({ users: 0, equipment: 0, bookings: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sumRes, userRes, eqRes, bookRes] = await Promise.all([
        api.get<AdminSummary>('/admin/summary'),
        api.get<{ users: User[] }>('/admin/users'),
        api.get<{ equipment: Equipment[] }>('/admin/equipment'),
        api.get<{ bookings: Booking[] }>('/admin/bookings'),
      ]);

      setSummary(sumRes.data);
      const userList = userRes.data.users || [];
      setUsers(userList);
      registerKnownUsers(userList);
      setEquipmentList(eqRes.data.equipment || []);
      setBookings(bookRes.data.bookings || []);
    } catch {
      showToast('error', 'Admin Access Error', 'Unable to fetch admin statistics. Ensure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--amber-soft)',
              color: 'var(--amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900 }}>Platform Administration</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Complete system oversight and telemetry</p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <RefreshCw size={15} />
            <span>Sync Data</span>
          </button>
        </div>

        {/* KPI Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
          
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: 'var(--blue-soft)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={26} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Users</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)' }}>{summary.users}</div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tractor size={26} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Equipment</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)' }}>{summary.equipment}</div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: 'var(--amber-soft)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={26} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Bookings</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)' }}>{summary.bookings}</div>
            </div>
          </div>

        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {(['overview', 'users', 'equipment', 'bookings'] as AdminTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                  backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}>
          {activeTab === 'overview' && (
            <div style={{ padding: '28px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Platform Quick Snapshot</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Recent Users */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>Recently Registered Users</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {users.slice(0, 5).map((u) => (
                      <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-muted)' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize', padding: '2px 8px', borderRadius: 6, backgroundColor: u.role === 'farmer' ? 'var(--primary-soft)' : 'var(--blue-soft)', color: u.role === 'farmer' ? 'var(--primary)' : 'var(--blue)' }}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Bookings */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>Recent Bookings</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {bookings.slice(0, 5).map((b) => {
                      const eq = typeof b.equipmentId === 'object' ? (b.equipmentId as Equipment) : null;
                      return (
                        <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-muted)' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{eq?.equipmentName || 'Equipment'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>₹{b.totalAmount.toLocaleString('en-IN')}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, backgroundColor: '#FFFFFF', color: 'var(--text-main)' }}>
                            {b.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Name</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Email</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Phone</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      onClick={() => onViewUser && onViewUser(u, 'User Account Details')}
                      style={{ borderBottom: '1px solid var(--border-light)', cursor: onViewUser ? 'pointer' : 'default', transition: 'background-color 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-muted)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{u.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'underline' }}>View Profile ↗</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{u.phone}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize', padding: '3px 10px', borderRadius: 10, backgroundColor: u.role === 'farmer' ? 'var(--primary-soft)' : u.role === 'owner' ? 'var(--blue-soft)' : 'var(--amber-soft)', color: u.role === 'farmer' ? 'var(--primary)' : u.role === 'owner' ? 'var(--blue)' : 'var(--amber)' }}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Equipment Name</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Daily Rate</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((eq) => (
                    <tr key={eq._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700 }}>{eq.equipmentName}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{eq.category}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)' }}>₹{eq.pricePerDay.toLocaleString('en-IN')} / day</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${eq.available ? 'badge-available' : 'badge-unavailable'}`}>
                          {eq.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Equipment</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Rental Dates</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Total Amount</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const eq = typeof b.equipmentId === 'object' ? (b.equipmentId as Equipment) : null;
                    return (
                      <tr key={b._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700 }}>{eq?.equipmentName || 'Equipment'}</td>
                        <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                          {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--primary)' }}>₹{b.totalAmount.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, backgroundColor: 'var(--bg-muted)', color: 'var(--text-main)' }}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
