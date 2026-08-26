import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';
import { AddEquipmentModal } from './components/AddEquipmentModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { Logo } from './components/Logo';
import api from './services/api';
import { resolveUser, registerKnownUsers } from './services/userDirectory';
import type { Equipment, User } from './types';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'home' | 'bookings' | 'admin' | 'profile'>('home');
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedEquipmentForBooking, setSelectedEquipmentForBooking] = useState<Equipment | null>(null);

  const [addEquipmentModalOpen, setAddEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // User profile modal state
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userModalTitle, setUserModalTitle] = useState<string | undefined>(undefined);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartBooking = (equipment: Equipment) => {
    setSelectedEquipmentForBooking(equipment);
    setBookingModalOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setAddEquipmentModalOpen(true);
  };

  const handleOpenAddEquipment = () => {
    setEditingEquipment(null);
    setAddEquipmentModalOpen(true);
  };

  const handleViewUser = async (targetUser: User, title?: string) => {
    // 1. Resolve true given user details from persistent directory
    let resolvedUser = resolveUser(targetUser) || { ...targetUser };

    // 2. If it is the currently logged in user, merge verified account email
    if (user && (targetUser._id === user._id || targetUser.phone === user.phone || targetUser.name === user.name)) {
      resolvedUser = { ...resolvedUser, ...user, email: user.email || resolvedUser.email };
    }

    // 3. If admin session is active and email is not yet in directory, fetch admin user records
    if (!resolvedUser.email && user?.role === 'admin') {
      try {
        const { data } = await api.get<{ users: User[] }>('/admin/users');
        if (data.users && Array.isArray(data.users)) {
          registerKnownUsers(data.users);
          const matched = data.users.find(
            (u: User) => u._id === resolvedUser._id || u.phone === resolvedUser.phone || u.name?.toLowerCase() === resolvedUser.name?.toLowerCase()
          );
          if (matched?.email) {
            resolvedUser.email = matched.email;
            resolvedUser.role = matched.role || resolvedUser.role;
          }
        }
      } catch {
        // ignore
      }
    }

    setViewingUser(resolvedUser);
    setUserModalTitle(title);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          if ((tab === 'bookings' || tab === 'profile') && !user) {
            handleOpenAuth('login');
            return;
          }
          if (tab === 'admin' && user?.role !== 'admin') {
            showToast('error', 'Unauthorized', 'Admin privileges required.');
            return;
          }
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={handleOpenAuth}
        onOpenAddEquipment={() => {
          if (!user) {
            handleOpenAuth('login');
            return;
          }
          handleOpenAddEquipment();
        }}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentTab === 'home' && (
          <HomePage
            onBook={handleStartBooking}
            onEdit={handleEditEquipment}
            onOpenAuth={handleOpenAuth}
            onOpenAddEquipment={handleOpenAddEquipment}
            onViewUser={handleViewUser}
            showToast={showToast}
          />
        )}

        {currentTab === 'bookings' && (
          <MyBookingsPage
            showToast={showToast}
            onBrowse={() => setCurrentTab('home')}
            onViewUser={handleViewUser}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage showToast={showToast} onViewUser={handleViewUser} />
        )}

        {currentTab === 'profile' && (
          <ProfilePage showToast={showToast} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1C2820',
        color: '#FFFFFF',
        padding: '48px 0 32px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32, marginBottom: 40 }}>
            <div style={{ maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ marginBottom: 14 }}>
                <Logo size="sm" theme="dark" showTagline={true} />
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Revolutionizing agricultural mechanization by providing verified, on-demand machinery rentals for smallholder and commercial farmers.
              </p>
            </div>

            <div>
              <h5 style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Categories</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                <span>Tractors & Implements</span>
                <span>Combined Harvesters</span>
                <span>Seeders & Planters</span>
                <span>Power Tillers & Rotavators</span>
              </div>
            </div>

            <div>
              <h5 style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Live Backend Status</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#A8E6CF' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2ECC71', display: 'inline-block' }} />
                <span>Connected to Live Render API</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
                api: agri-rent-gzex.onrender.com
              </p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
          }}>
            <span>© {new Date().getFullYear()} AgriRent Platform. All rights reserved.</span>
            <span>Empowering Farmers Everywhere</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(msg) => showToast('success', 'Authenticated', msg)}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        equipment={selectedEquipmentForBooking}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={(msg) => {
          showToast('success', 'Reservation Submitted', msg);
          setCurrentTab('bookings');
        }}
        onOpenAuth={handleOpenAuth}
        onViewUser={handleViewUser}
      />

      <AddEquipmentModal
        isOpen={addEquipmentModalOpen}
        editingItem={editingEquipment}
        onClose={() => setAddEquipmentModalOpen(false)}
        onSuccess={(msg) => {
          showToast('success', 'Catalog Updated', msg);
          setCurrentTab('home');
        }}
      />

      {/* User / Farmer / Owner Profile Details Modal */}
      <UserProfileModal
        isOpen={Boolean(viewingUser)}
        user={viewingUser}
        title={userModalTitle}
        onClose={() => setViewingUser(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
