import React, { useEffect, useState, useMemo } from 'react';
import type { Equipment, User } from '../types';
import api from '../services/api';
import { EquipmentCard } from '../components/EquipmentCard';
import { Logo } from '../components/Logo';
import { Search, RefreshCw, Sparkles, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onBook: (equipment: Equipment) => void;
  onEdit: (equipment: Equipment) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAddEquipment: () => void;
  onViewUser: (user: User, title?: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const CATEGORIES = [
  { id: 'All', label: 'All Equipment', icon: '🌾' },
  { id: 'Tractor', label: 'Tractors', icon: '🚜' },
  { id: 'Seeder', label: 'Seeders & Drills', icon: '🌱' },
  { id: 'Harvester', label: 'Harvesters', icon: '🌾' },
  { id: 'Rotavator', label: 'Rotavators & Tillers', icon: '⚙️' },
  { id: 'Sprayer', label: 'Crop Sprayers', icon: '💧' },
];

export const HomePage: React.FC<HomePageProps> = ({
  onBook,
  onEdit,
  onOpenAddEquipment,
  onViewUser,
  showToast,
}) => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ equipment: Equipment[] }>('/equipment');
      setEquipmentList(data.equipment || []);
    } catch {
      showToast('error', 'Could not load equipment', 'Please make sure the backend server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleToggleStatus = async (item: Equipment) => {
    try {
      const newStatus = !item.available;
      await api.patch(`/equipment/${item._id}/status`, { available: newStatus });
      setEquipmentList((prev) =>
        prev.map((eq) => (eq._id === item._id ? { ...eq, available: newStatus } : eq))
      );
      showToast('info', 'Status Updated', `Equipment is now ${newStatus ? 'Available' : 'Unavailable'}`);
    } catch {
      showToast('error', 'Update Failed', 'Could not toggle equipment status.');
    }
  };

  const handleDelete = async (equipmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment listing?')) return;
    try {
      await api.delete(`/equipment/${equipmentId}`);
      setEquipmentList((prev) => prev.filter((eq) => eq._id !== equipmentId));
      showToast('success', 'Listing Deleted', 'The equipment listing has been removed.');
    } catch {
      showToast('error', 'Delete Failed', 'Could not remove equipment listing.');
    }
  };

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAvailable = !onlyAvailable || item.available;

      return matchesCategory && matchesSearch && matchesAvailable;
    });
  }, [equipmentList, selectedCategory, searchQuery, onlyAvailable]);

  return (
    <div>
      
      {/* Brand Hero Showcase Section */}
      <section style={{
        backgroundColor: '#E5F1E5',
        backgroundImage: 'linear-gradient(180deg, #EDF7ED 0%, #DCECDC 60%, #CCE3CC 100%)',
        padding: '50px 0 20px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          
          {/* Main Brand Logo & Tagline Header */}
          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Logo size="xl" showTagline={true} />
          </div>

          <p style={{
            fontSize: 'clamp(15px, 2.2vw, 18px)',
            color: 'var(--text-muted)',
            maxWidth: 620,
            margin: '0 auto 28px',
            lineHeight: 1.6,
          }}>
            Rent high-performance tractors, harvesters, and specialized farm machinery from local equipment owners at transparent, affordable daily rates.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 36 }}>
            <a
              href="#catalog"
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: 15, borderRadius: 'var(--radius-full)' }}
            >
              <span>🚜 Explore Machinery</span>
              <ArrowRight size={16} />
            </a>

            {user?.role === 'owner' ? (
              <button
                onClick={onOpenAddEquipment}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', fontSize: 15, borderRadius: 'var(--radius-full)' }}
              >
                <PlusCircle size={16} />
                <span>List Your Equipment</span>
              </button>
            ) : null}
          </div>

          {/* Farm Artwork Showcase Banner */}
          <div style={{
            maxWidth: 960,
            margin: '0 auto',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: '4px solid #FFFFFF',
            position: 'relative',
            backgroundColor: '#C5DEC5',
          }}>
            <img
              src="/hero-banner.png"
              alt="AgriRent Farm Machinery Showcase"
              style={{
                width: '100%',
                maxHeight: 380,
                objectFit: 'cover',
                objectPosition: 'center bottom',
                display: 'block',
              }}
            />
          </div>

        </div>
      </section>

      {/* Filter and Search Bar Section */}
      <section id="catalog" style={{ marginTop: -28, position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 24px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
          }}>
            
            {/* Search Input */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="text"
                placeholder="Search machinery by name, brand, or implement type..."
                className="input-field"
                style={{ paddingLeft: 42, marginBottom: 0 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Availability Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-light)' }}
              />
              <span>Available Now</span>
            </label>

            {/* Refresh / Reset */}
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setOnlyAvailable(false); fetchEquipment(); }}
              className="btn btn-secondary"
              style={{ padding: '10px 16px', fontSize: 13 }}
              title="Refresh listings"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            {user?.role === 'owner' && (
              <button
                onClick={onOpenAddEquipment}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                + Add Equipment
              </button>
            )}

          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section style={{ padding: '36px 0 16px' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
          }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                    backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? '0 4px 14px rgba(27, 77, 46, 0.25)' : 'var(--shadow-sm)',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <span style={{ fontSize: 17 }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Equipment Catalog Grid */}
      <section style={{ padding: '16px 0 64px' }}>
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)' }}>Featured Farming Machinery</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Showing {filteredEquipment.length} {filteredEquipment.length === 1 ? 'equipment listing' : 'equipment listings'}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  height: 320,
                  border: '1px solid var(--border-light)',
                  animation: 'fadeIn 0.6s infinite alternate',
                }} />
              ))}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '64px 20px',
              textAlign: 'center',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🚜</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>No Equipment Found</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 20px' }}>
                We couldn't find any equipment matching your criteria. Try adjusting your search query or selected category.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setOnlyAvailable(false); }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}>
              {filteredEquipment.map((item) => (
                <EquipmentCard
                  key={item._id}
                  item={item}
                  onBook={onBook}
                  onEdit={onEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  onViewUser={onViewUser}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Quality Standards & Trust Badges */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '64px 0', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Modern Agricultural Solutions</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
              Empowering farmers across India with access to advanced machinery without high ownership expenses.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            <div style={{
              padding: '30px 26px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#EBF5EE',
              border: '1.5px solid #D5E8D9',
            }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🚜</div>
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--primary)' }}>Access Top Machinery</h4>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Rent powerful 4WD tractors, laser land levelers, rotavators, and combine harvesters on-demand.
              </p>
            </div>

            <div style={{
              padding: '30px 26px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FEF9EE',
              border: '1.5px solid #F8E9CD',
            }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🌾</div>
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#B78103' }}>Maximize Harvest Efficiency</h4>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Complete harvesting, sowing, and tilling on schedule without delays or labor shortages.
              </p>
            </div>

            <div style={{
              padding: '30px 26px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#EEF0FA',
              border: '1.5px solid #D5DCF5',
            }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🛡️</div>
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--blue)' }}>Direct & Verified Rentals</h4>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Transparent daily rates, verified equipment owners, and simple date-based booking flow.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
