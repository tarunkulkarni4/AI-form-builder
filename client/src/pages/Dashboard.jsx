import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
    Plus, FileText, ExternalLink, BarChart2,
    Loader2, Zap, Edit3, Trash2, Sparkles, CheckCircle2, Clock,
    Link, Sun, Moon, Power
} from 'lucide-react';
import AIWizard from '../components/AIWizard/AIWizard';
import ConfirmModal from '../components/ConfirmModal';
import Footer from '../components/Footer';
import api from '../services/api';

/* ── Glow Ring Icon ── */
const GlowRingIcon = ({ children, size = 'sm' }) => (
    <div className="glow-ring">
        <div className={`glow-ring-inner ${size === 'lg' ? 'p-4' : 'p-2.5'}`}>{children}</div>
    </div>
);

/* ── Animated counter ── */
const AnimCounter = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const end = parseInt(value) || 0;
        if (end === 0) { setDisplay(0); return; }
        let start = 0;
        const step = Math.ceil(end / 20);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setDisplay(end); clearInterval(timer); }
            else setDisplay(start);
        }, 40);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{typeof value === 'string' && isNaN(value) ? value : display}</span>;
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const [forms, setForms] = useState([]);
    const [showWizard, setShowWizard] = useState(false);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchForms = async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            const { data } = await api.get(`/form/user/${user._id}`);
            setForms(data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load forms.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            showToast(`Welcome back, ${user.name?.split(' ')[0]}! 👋`, 'success');
            fetchForms();
        }
    }, [user]);

    const handleLogout = async () => {
        showToast('Logging out... 👋', 'info');
        setTimeout(async () => {
            await logout();
        }, 1200);
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/form/${confirmDelete}`);
            setForms(prev => prev.filter(f => f._id !== confirmDelete));
            showToast('Form deleted successfully.', 'success');
        } catch {
            showToast('Failed to delete form.', 'error');
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleComplete = (newForm) => {
        setForms(prev => [newForm, ...prev]);
        setShowWizard(false);
        showToast('🎉 Google Form created and synced!', 'success');
    };

    const stats = [
        { label: 'Total Forms', value: forms.length, icon: FileText, color: '#6366f1', delay: 0.1 },
        { label: 'Responses', value: forms.reduce((a, f) => a + (f.responseCount || 0), 0), icon: BarChart2, color: '#8b5cf6', delay: 0.2 },
        { label: 'Uptime', value: '100%', icon: CheckCircle2, color: '#10b981', delay: 0.3 },
    ];

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

            {/* ── Mesh Background ── */}
            <div className="mesh-bg">
                <div className="mesh-orb" style={{ width: 650, height: 650, top: '-20%', right: '-15%', background: 'radial-gradient(circle, #6366f1, transparent 70%)', animationDuration: '12s' }} />
                <div className="mesh-orb" style={{ width: 500, height: 500, bottom: '-15%', left: '-10%', background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', animationDuration: '15s', animationDelay: '3s' }} />
                <div className="mesh-orb" style={{ width: 300, height: 300, top: '50%', left: '35%', background: 'radial-gradient(circle, #ec4899, transparent 70%)', animationDuration: '9s', animationDelay: '5s', opacity: 0.07 }} />
            </div>

            {confirmDelete && (
                <ConfirmModal
                    message="Permanently remove this form?"
                    confirmLabel="Delete"
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {showWizard && (
                <AIWizard onCancel={() => setShowWizard(false)} onComplete={handleComplete} />
            )}

            {/* ═══ NAVBAR ═══ */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                height: 68,
                display: 'flex', alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                background: 'var(--header-bg)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
            }}>
                <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 flex items-center justify-between">

                    {/* ── Brand ── */}
                    <div className="flex items-center gap-3">
                        {/* Spinning glow ring */}
                        <div className="glow-ring">
                            <div className="glow-ring-inner p-2">
                                <Zap className="h-4 w-4 text-white" fill="rgba(255,255,255,0.5)" />
                            </div>
                        </div>
                        <div>
                            <div className="text-base font-black tracking-tight" style={{
                                background: 'linear-gradient(135deg, var(--accent), var(--accent2), var(--accent3))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                backgroundSize: '200%',
                                animation: 'shimmer-move 4s linear infinite',
                            }}>
                                AI-Form-Builder
                            </div>
                            <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--text3)' }}>
                                Powered by Groq · Llama 3.3
                            </div>
                        </div>
                    </div>

                    {/* ── Right actions — only theme + logout ── */}
                    <div className="flex items-center gap-2">

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="nav-btn tip"
                            data-tip={isDark ? 'Light mode' : 'Dark mode'}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="nav-btn danger tip"
                            data-tip="Log out"
                        >
                            <Power className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 relative z-10">

                {/* ── Hero ── */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div className="anim-slide-up">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"
                                style={{ boxShadow: '0 0 8px #10b981', animation: 'pulse-ring 2s ease-in-out infinite' }} />
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
                                Session Active
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-1">
                            Hey {user?.name?.split(' ')[0]},
                        </h1>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.05]">
                            <span className="grad-text">Welcome back!</span>
                        </h2>
                        <p className="mt-4 text-base font-medium max-w-md leading-relaxed" style={{ color: 'var(--text2)' }}>
                            {forms.length > 0
                                ? `You have ${forms.length} active form${forms.length !== 1 ? 's' : ''} — workspace ready.`
                                : 'Create your first AI-powered form below.'}
                        </p>
                    </div>

                    <div className="anim-slide-up delay-200">
                        <button onClick={() => setShowWizard(true)} className="btn-primary px-8 py-4 text-base group">
                            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
                            Create Form
                            <Sparkles className="h-4 w-4 opacity-70" />
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    {stats.map(({ label, value, icon: Icon, color, delay }) => (
                        <div key={label} className="stat-card" style={{ animationDelay: `${delay}s`, borderTopWidth: 2, borderTopStyle: 'solid', borderTopColor: color }}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>{label}</span>
                                <div className="p-2 rounded-xl" style={{ background: `${color}18` }}>
                                    <Icon className="h-4 w-4" style={{ color }} />
                                </div>
                            </div>
                            <div className="text-4xl font-black tracking-tighter" style={{ color: 'var(--text)' }}>
                                <AnimCounter value={value} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── How It Works ── */}
                <div className="mb-12 anim-slide-up delay-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--accent), var(--accent2))' }} />
                        <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>How It Works</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { step: '01', title: 'Create Form', desc: 'Open the AI Wizard and describe your form idea', icon: '✏️', color: '#6366f1' },
                            { step: '02', title: 'Analyze Prompt', desc: 'AI reads and understands your requirements', icon: '🧠', color: '#8b5cf6' },
                            { step: '03', title: 'Configure Sections', desc: 'Choose form type, sections and structure', icon: '⚙️', color: '#ec4899' },
                            { step: '04', title: 'Generate Form', desc: 'Groq Llama 3.3 creates your Google Form live', icon: '⚡', color: '#f59e0b' },
                            { step: '05', title: 'Spreadsheets', desc: 'Responses auto-sync to Google Sheets instantly', icon: '📊', color: '#10b981' },
                        ].map(({ step, title, desc, icon, color }, i) => (
                            <div key={step} className="relative rounded-2xl p-5 border"
                                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                                {/* Connector line — desktop only */}
                                {i < 4 && (
                                    <div className="hidden md:block absolute top-[2.25rem] right-0 w-6 h-[1px] translate-x-full"
                                        style={{ background: `linear-gradient(to right, ${color}70, transparent)` }} />
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                                        style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                                        {icon}
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest uppercase" style={{ color }}>{step}</span>
                                </div>
                                <div className="text-sm font-black mb-1" style={{ color: 'var(--text)' }}>{title}</div>
                                <div className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Forms Section ── */}
                <div>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--accent), var(--accent2))' }} />
                            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>Your Forms</h2>
                            <span className="badge badge-blue ml-1">{forms.length}</span>
                        </div>
                        {forms.length > 0 && (
                            <button onClick={() => setShowWizard(true)} className="btn-ghost text-xs px-4 py-2">
                                <Plus className="h-3.5 w-3.5" /> New
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: 'var(--text3)' }}>
                            <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
                            <p className="text-xs font-bold uppercase tracking-widest">Loading…</p>
                        </div>

                    ) : forms.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <div className="flex justify-center mb-5">
                                <GlowRingIcon size="lg">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </GlowRingIcon>
                            </div>
                            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>No forms yet</h3>
                            <p className="text-sm mb-7 max-w-xs mx-auto" style={{ color: 'var(--text2)' }}>
                                Describe your idea — AI builds it in seconds.
                            </p>
                            <button onClick={() => setShowWizard(true)} className="btn-primary px-8 py-3">
                                <Zap className="h-4 w-4" /> Launch Wizard
                            </button>
                        </div>

                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {forms.map((form, i) => (
                                <div key={form._id} className="form-card group" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                            <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                                        </div>
                                        <span className={`badge ${form.isActive ? 'badge-green' : 'badge-red'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'currentColor' }} />
                                            {form.isActive ? 'Live' : 'Closed'}
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-black mb-1 line-clamp-2 tracking-tight" style={{ color: 'var(--text)' }}>
                                        {form.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mb-5" style={{ color: 'var(--text3)' }}>
                                        <Clock className="h-3 w-3" />
                                        <span className="text-[10px] font-bold">{new Date(form.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <a href={form.publicUrl} target="_blank" rel="noopener noreferrer"
                                            className="tip flex items-center justify-center py-2 rounded-xl text-xs font-bold border transition-colors"
                                            data-tip="Open Google Form"
                                            style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--text2)' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                                            Open
                                        </a>
                                        <a href={form.editUrl} target="_blank" rel="noopener noreferrer"
                                            className="tip flex items-center justify-center py-2 rounded-xl text-xs font-bold border transition-colors"
                                            data-tip="Link to Spreadsheets"
                                            style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--text2)' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border-glow)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                                            Edit
                                        </a>
                                        <button onClick={() => setConfirmDelete(form._id)}
                                            className="tip flex items-center justify-center py-2 rounded-xl text-xs font-bold border transition-colors"
                                            data-tip="Delete Form"
                                            style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--text2)' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
