import React, { useState, useEffect } from 'react';
import type { Equipment } from '../types';
import api from '../services/api';
import { X, PlusCircle, Tractor, Tag, IndianRupee, FileText } from 'lucide-react';

interface AddEquipmentModalProps {
  isOpen: boolean;
  editingItem: Equipment | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const CATEGORIES = ['Tractor', 'Seeder', 'Harvester', 'Rotavator', 'Sprayer'];

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  editingItem,
  onClose,
  onSuccess,
}) => {
  const [equipmentName, setEquipmentName] = useState('');
  const [category, setCategory] = useState('Tractor');
  const [description, setDescription] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [available, setAvailable] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setEquipmentName(editingItem.equipmentName);
      setCategory(editingItem.category);
      setDescription(editingItem.description);
      setPricePerDay(String(editingItem.pricePerDay));
      setAvailable(editingItem.available);
    } else {
      setEquipmentName('');
      setCategory('Tractor');
      setDescription('');
      setPricePerDay('');
      setAvailable(true);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim() || !category || !description.trim() || !pricePerDay) {
      setError('Please fill in all required fields.');
      return;
    }

    const price = Number(pricePerDay);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid positive daily price.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (editingItem) {
        await api.put(`/equipment/${editingItem._id}`, {
          equipmentName: equipmentName.trim(),
          category,
          description: description.trim(),
          pricePerDay: price,
          available,
        });
        onSuccess(`Updated "${equipmentName}" successfully!`);
      } else {
        await api.post('/equipment', {
          equipmentName: equipmentName.trim(),
          category,
          description: description.trim(),
          pricePerDay: price,
        });
        onSuccess(`Added "${equipmentName}" to your active catalog!`);
      }
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(axiosErr.response?.data?.message || axiosErr.message || 'Failed to save equipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        
        {/* Header */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Tractor size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                {editingItem ? 'Edit Equipment Listing' : 'List New Farming Equipment'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {editingItem ? 'Update specifications and daily rate' : 'Reach farmers looking for machinery'}
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

        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          
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

          {/* Name */}
          <div className="input-group">
            <label className="input-label">Equipment Model / Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Deere 5050D 4WD Tractor"
              className="input-field"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
            />
          </div>

          {/* Category selection */}
          <div className="input-group">
            <label className="input-label">Category *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${category === cat ? 'var(--primary)' : 'var(--border-light)'}`,
                    backgroundColor: category === cat ? 'var(--primary-soft)' : '#FFFFFF',
                    color: category === cat ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Price */}
          <div className="input-group">
            <label className="input-label">Daily Rental Rate (₹ / day) *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                required
                min="100"
                step="50"
                placeholder="e.g. 2500"
                className="input-field"
                style={{ paddingLeft: 40 }}
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
              <span style={{ position: 'absolute', left: 16, top: 12, fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">Description & Condition *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe HP, attachments included, maintenance condition, operator availability..."
              className="input-field"
              style={{ resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Availability toggle for edit */}
          {editingItem && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 20px' }}>
              <input
                type="checkbox"
                id="availableCheck"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="availableCheck" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                Equipment is currently Available for booking
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 10 }}
          >
            {loading ? 'Saving...' : editingItem ? 'Save Changes →' : 'Publish Listing →'}
          </button>
        </form>

      </div>
    </div>
  );
};
