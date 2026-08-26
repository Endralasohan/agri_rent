import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxWidth: 400,
      width: '100%',
    }}>
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: 'var(--shadow-lg)',
              borderLeft: `4px solid ${isSuccess ? 'var(--primary)' : isError ? 'var(--danger)' : 'var(--blue)'}`,
            }}
          >
            {isSuccess && <CheckCircle2 size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />}
            {isError && <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />}
            {!isSuccess && !isError && <Info size={20} color="var(--blue)" style={{ flexShrink: 0, marginTop: 2 }} />}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{toast.title}</div>
              {toast.message && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{toast.message}</div>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
