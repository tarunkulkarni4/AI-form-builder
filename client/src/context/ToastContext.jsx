import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />,
    error: <XCircle className="h-5 w-5 text-red-400    flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-indigo-400 flex-shrink-0" />,
};

const colors = {
    success: { border: 'rgba(52,211,153,0.3)', bg: 'rgba(52,211,153,0.08)' },
    error: { border: 'rgba(248,113,113,0.3)', bg: 'rgba(248,113,113,0.08)' },
    warning: { border: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.08)' },
    info: { border: 'rgba(99,102,241,0.3)', bg: 'rgba(99,102,241,0.08)' },
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container — top-right */}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id}
                        className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl"
                        style={{
                            background: 'var(--surface2)',
                            border: `1px solid ${colors[toast.type].border}`,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px ${colors[toast.type].border}`,
                            animation: 'slide-up-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
                            fontFamily: 'Outfit, system-ui, sans-serif',
                        }}>
                        {icons[toast.type]}
                        <p className="text-sm font-semibold flex-1 leading-snug" style={{ color: 'var(--text)' }}>
                            {toast.message}
                        </p>
                        <button onClick={() => dismiss(toast.id)}
                            className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                            style={{ color: 'var(--text2)' }}>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
