import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
    Plus, FileText, ExternalLink, BarChart2,
    Loader2, Zap, Edit3, Trash2, Sparkles, CheckCircle2, Clock, Calendar,
    Sun, Moon, Power, Copy, Search, LayoutTemplate, CopyPlus
} from 'lucide-react';
import AIWizard from '../components/AIWizard/AIWizard';
import ConfirmModal from '../components/ConfirmModal';
import ExpandFormModal from '../components/ExpandFormModal';
import TemplatesModal from '../components/TemplatesModal';
import Footer from '../components/Footer';
import api from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const [forms, setForms] = useState([]);
    const [showWizard, setShowWizard] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [expandTarget, setExpandTarget] = useState(null);
    const [duplicatingId, setDuplicatingId] = useState(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

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
            showToast(`Welcome back, ${user.name?.split(' ')[0]}!`, 'success');
            fetchForms();
        }
    }, [user]);

    const handleLogout = async () => {
        showToast('Logging out...', 'info');
        setTimeout(async () => { await logout(); }, 800);
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/form/${confirmDelete}`);
            setForms(prev => prev.filter(f => f._id !== confirmDelete));
            showToast('Form deleted.', 'success');
        } catch {
            showToast('Failed to delete form.', 'error');
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleComplete = (newForm) => {
        setForms(prev => [newForm, ...prev]);
        setShowWizard(false);
        showToast('Form created successfully!', 'success');
    };

    const handleTemplateComplete = (newForm) => {
        setForms(prev => [newForm, ...prev]);
        showToast('Template form created!', 'success');
    };

    const handleDuplicate = async (form) => {
        setDuplicatingId(form._id);
        try {
            const { data } = await api.post(`/form/duplicate/${form._id}`, { userId: user._id });
            setForms(prev => [data, ...prev]);
            showToast(`"${form.title}" duplicated!`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to duplicate form.', 'error');
        } finally {
            setDuplicatingId(null);
        }
    };

    const handleCopyLink = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied!', 'success');
        });
    };

    const filteredForms = useMemo(() => {
        const now = new Date();
        return forms
            .filter(f => {
                const q = search.toLowerCase();
                if (q && !f.title.toLowerCase().includes(q)) return false;
                if (statusFilter === 'live') {
                    const expired = f.isExpired || (f.expiryDate && new Date(f.expiryDate) < now);
                    if (expired || !f.isActive) return false;
                }
                if (statusFilter === 'expired') {
                    const expired = f.isExpired || (f.expiryDate && new Date(f.expiryDate) < now);
                    if (!expired) return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                if (sortBy === 'title') return a.title.localeCompare(b.title);
                return 0;
            });
    }, [forms, search, statusFilter, sortBy]);

    const liveForms = forms.filter(f => {
        const now = new Date();
        const expired = f.isExpired || (f.expiryDate && new Date(f.expiryDate) < now);
        return !expired && f.isActive;
    }).length;

    const stats = [
        { label: 'Total Forms', value: forms.length, icon: FileText, color: '#6366f1' },
        { label: 'Live Forms', value: liveForms, icon: CheckCircle2, color: '#10b981' },
        { label: 'Responses', value: forms.reduce((a, f) => a + (f.responseCount || 0), 0), icon: BarChart2, color: '#8b5cf6' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>

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

            {expandTarget && (
                <ExpandFormModal
                    form={expandTarget}
                    userId={user._id}
                    onClose={() => setExpandTarget(null)}
                />
            )}

            {showTemplates && (
                <TemplatesModal
                    onClose={() => setShowTemplates(false)}
                    onComplete={handleTemplateComplete}
                />
            )}

            {/* ── NAVBAR ── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                height: 60,
                display: 'flex', alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                background: 'var(--header-bg)',
                backdropFilter: 'blur(16px)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(135deg, var(--accent), var(--accent2))'
                        }}>
                            <Zap style={{ width: 16, height: 16, color: '#fff' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)' }}>AI Form Builder</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em' }}>Powered by Groq · Llama 3.3</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={toggleTheme} className="nav-btn tip" data-tip={isDark ? 'Light mode' : 'Dark mode'}>
                            {isDark ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
                        </button>
                        <button onClick={handleLogout} className="nav-btn danger tip" data-tip="Log out">
                            <Power style={{ width: 15, height: 15 }} />
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 24px' }}>

                {/* ── Hero ── */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)' }}>Session Active</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
                            Hey {user?.name?.split(' ')[0]},
                        </h1>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, lineHeight: 1.1, margin: 0, color: 'var(--accent)' }}>
                            Welcome back!
                        </h2>
                        <p style={{ marginTop: 10, fontSize: '0.9rem', color: 'var(--text2)', maxWidth: 400 }}>
                            {forms.length > 0
                                ? `You have ${forms.length} form${forms.length !== 1 ? 's' : ''} — workspace ready.`
                                : 'Create your first AI-powered form below.'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowTemplates(true)} className="btn-ghost" style={{ padding: '10px 18px', fontSize: '0.83rem' }}>
                            <LayoutTemplate style={{ width: 15, height: 15 }} />
                            Templates
                        </button>
                        <button onClick={() => setShowWizard(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                            <Plus style={{ width: 16, height: 16 }} />
                            Create Form
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
                    {stats.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="stat-card" style={{ borderTop: `2px solid ${color}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)' }}>{label}</span>
                                <div style={{ padding: 6, borderRadius: 8, background: `${color}18` }}>
                                    <Icon style={{ width: 14, height: 14, color }} />
                                </div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* ── How It Works ── */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 3, height: 18, borderRadius: 4, background: 'var(--accent)' }} />
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>How It Works</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                        {[
                            { step: '01', title: 'Create Form', desc: 'Open the AI Wizard and describe your form idea', icon: '✏️', color: '#6366f1' },
                            { step: '02', title: 'Analyze Prompt', desc: 'AI reads and understands your requirements', icon: '🧠', color: '#8b5cf6' },
                            { step: '03', title: 'Configure Sections', desc: 'Choose form type, sections and structure', icon: '⚙️', color: '#ec4899' },
                            { step: '04', title: 'Generate Form', desc: 'Groq Llama 3.3 creates your Google Form live', icon: '⚡', color: '#f59e0b' },
                            { step: '05', title: 'Spreadsheets', desc: 'Responses auto-sync to Google Sheets instantly', icon: '📊', color: '#10b981' },
                        ].map(({ step, title, desc, icon, color }) => (
                            <div key={step} style={{ padding: '16px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, border: `1px solid ${color}30`, fontSize: '0.9rem' }}>
                                        {icon}
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color }}>{step}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.5 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Forms Section ── */}
                <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 3, height: 18, borderRadius: 4, background: 'var(--accent)' }} />
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>Your Forms</h2>
                            <span className="badge badge-blue">{filteredForms.length}/{forms.length}</span>
                        </div>
                    </div>

                    {/* Toolbar */}
                    {forms.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 260 }}>
                                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text3)' }} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search forms…"
                                    className="input-field"
                                    style={{ paddingLeft: 30, paddingTop: 7, paddingBottom: 7, fontSize: '0.78rem' }}
                                />
                            </div>
                            {['all', 'live', 'expired'].map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    style={{
                                        fontSize: '0.7rem', fontWeight: 700, padding: '6px 14px',
                                        borderRadius: 99, border: '1px solid',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                        borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
                                        background: statusFilter === s ? 'var(--accent)' : 'transparent',
                                        color: statusFilter === s ? '#fff' : 'var(--text2)',
                                    }}>
                                    {s === 'all' ? 'All' : s === 'live' ? 'Live' : 'Expired'}
                                </button>
                            ))}
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="input-field"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto', cursor: 'pointer' }}>
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="title">A → Z</option>
                            </select>
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: 'var(--text3)' }}>
                            <Loader2 style={{ width: 32, height: 32, color: 'var(--accent)' }} className="animate-spin" />
                            <p style={{ marginTop: 12, fontSize: '0.8rem', fontWeight: 600 }}>Loading forms…</p>
                        </div>

                    ) : forms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: 16, border: '1px dashed var(--border)', background: 'var(--surface)' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent2))'
                            }}>
                                <Sparkles style={{ width: 24, height: 24, color: '#fff' }} />
                            </div>
                            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>No forms yet</h3>
                            <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'var(--text2)', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
                                Describe your idea — AI builds it in seconds.
                            </p>
                            <button onClick={() => setShowWizard(true)} className="btn-primary" style={{ padding: '10px 24px' }}>
                                <Zap style={{ width: 15, height: 15 }} /> Launch Wizard
                            </button>
                        </div>

                    ) : filteredForms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', borderRadius: 16, border: '1px dashed var(--border)' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text3)', margin: '0 0 12px' }}>No forms match your search.</p>
                            <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.78rem' }}>Clear filters</button>
                        </div>

                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {filteredForms.map((form) => {
                                const expiryDate = form.expiryDate ? new Date(form.expiryDate) : null;
                                const now = new Date();
                                const isExpired = form.isExpired || (expiryDate && expiryDate < now);

                                return (
                                    <div key={form._id} className="form-card">
                                        {/* Card top */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                                            <div style={{ padding: '8px', borderRadius: 10, background: 'var(--accent-glow)', border: '1px solid var(--border)' }}>
                                                <FileText style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                                            </div>
                                            {isExpired ? (
                                                <span className="badge badge-red">● Expired</span>
                                            ) : (
                                                <span className={`badge ${form.isActive ? 'badge-green' : 'badge-red'}`}>
                                                    ● {form.isActive ? 'Live' : 'Closed'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h3 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>
                                            {form.title}
                                        </h3>

                                        {/* Meta */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)' }}>
                                                <Clock style={{ width: 11, height: 11 }} />
                                                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                                    Created: {new Date(form.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            {form.expiryDate && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}>
                                                    <Calendar style={{ width: 11, height: 11 }} />
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                                        Expires: {new Date(form.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {/* Expand with AI — full width */}
                                            <button
                                                onClick={() => setExpandTarget(form)}
                                                className="btn-ghost"
                                                style={{ width: '100%', padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}>
                                                <Sparkles style={{ width: 13, height: 13 }} /> Expand with AI
                                            </button>
                                            {/* Icon row */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                                <a href={form.publicUrl} target="_blank" rel="noopener noreferrer"
                                                    className="tip"
                                                    data-tip="Open Form"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        padding: '8px', borderRadius: 8, border: '1px solid var(--border)',
                                                        background: 'transparent', color: 'var(--text2)', textDecoration: 'none',
                                                        transition: 'border-color 0.15s, color 0.15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                                                    <ExternalLink style={{ width: 14, height: 14 }} />
                                                </a>
                                                <a href={form.editUrl} target="_blank" rel="noopener noreferrer"
                                                    className="tip"
                                                    data-tip="Edit Form"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        padding: '8px', borderRadius: 8, border: '1px solid var(--border)',
                                                        background: 'transparent', color: 'var(--text2)', textDecoration: 'none',
                                                        transition: 'border-color 0.15s, color 0.15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                                                    <Edit3 style={{ width: 14, height: 14 }} />
                                                </a>
                                                <button onClick={() => handleCopyLink(form.publicUrl)}
                                                    className="tip"
                                                    data-tip="Copy Link"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        padding: '8px', borderRadius: 8, border: '1px solid var(--border)',
                                                        background: 'transparent', color: 'var(--text2)', cursor: 'pointer',
                                                        transition: 'border-color 0.15s, color 0.15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                                                    <Copy style={{ width: 14, height: 14 }} />
                                                </button>
                                                <button onClick={() => handleDuplicate(form)} disabled={duplicatingId === form._id}
                                                    className="tip"
                                                    data-tip="Duplicate"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        padding: '8px', borderRadius: 8, border: '1px solid var(--border)',
                                                        background: 'transparent', color: 'var(--text2)', cursor: 'pointer',
                                                        transition: 'border-color 0.15s, color 0.15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                                                    {duplicatingId === form._id
                                                        ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                                                        : <CopyPlus style={{ width: 14, height: 14 }} />}
                                                </button>
                                            </div>
                                            {/* Delete */}
                                            <button onClick={() => setConfirmDelete(form._id)}
                                                className="btn-ghost"
                                                style={{ width: '100%', padding: '7px', fontSize: '0.75rem', justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}>
                                                <Trash2 style={{ width: 13, height: 13 }} /> Delete Form
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
