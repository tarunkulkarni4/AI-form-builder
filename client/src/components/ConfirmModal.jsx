import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

/**
 * ConfirmModal — replaces window.confirm() with a styled in-app dialog.
 * Usage: <ConfirmModal message="..." onConfirm={fn} onCancel={fn} />
 */
const ConfirmModal = ({ message, confirmLabel = 'Delete', onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in"
                style={{ background: 'var(--card-bg)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)' }}>
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        Are you sure?
                    </h3>
                </div>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        <Trash2 className="h-4 w-4" />
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
