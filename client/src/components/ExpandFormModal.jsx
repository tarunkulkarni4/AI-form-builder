import React, { useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle2, Plus } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ExpandFormModal = ({ form, userId, onClose }) => {
    const { showToast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { questionsAdded, questions }

    const handleExpand = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const { data } = await api.post(`/form/expand/${form._id}`, { prompt, userId });
            setResult(data);
            showToast(`✅ Added ${data.questionsAdded} new question${data.questionsAdded !== 1 ? 's' : ''} to your form!`, 'success');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to expand form. Try again.';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: 'var(--bg2, #0d0d22)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '2rem',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Sparkles style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>Expand with AI</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text2)', margin: 0, maxWidth: '340px' }}>
                            Describe what to add to <strong style={{ color: 'var(--text)' }}>"{form.title}"</strong>
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}
                    >
                        <X style={{ width: 16, height: 16 }} />
                    </button>
                </div>

                {/* Examples */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                    {[
                        'Add contact details section',
                        'Add payment preferences',
                        'Add dietary requirements',
                        'Add availability dates',
                    ].map(ex => (
                        <button key={ex} onClick={() => setPrompt(ex)}
                            style={{
                                fontSize: '0.68rem', fontWeight: 600,
                                padding: '4px 10px', borderRadius: '99px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface)', color: 'var(--text2)',
                                cursor: 'pointer', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.color = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                        >
                            {ex}
                        </button>
                    ))}
                </div>

                {/* Textarea */}
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Add a section for shipping address with city, state and pin code"
                    rows={3}
                    className="input-field"
                    style={{ resize: 'vertical', marginBottom: '1rem', lineHeight: 1.5 }}
                    disabled={loading}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleExpand(); }}
                />

                {/* Result preview */}
                {result && (
                    <div style={{
                        background: 'rgba(16,185,129,0.07)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: '12px', padding: '0.875rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CheckCircle2 style={{ width: 14, height: 14, color: '#10b981' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                                {result.questionsAdded} question{result.questionsAdded !== 1 ? 's' : ''} added!
                            </span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {result.questions.map((q, i) => (
                                <li key={i} style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{q.title}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
                        {result ? 'Done' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleExpand}
                        disabled={!prompt.trim() || loading}
                        className="btn-primary"
                        style={{ flex: 2 }}
                    >
                        {loading
                            ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Generating…</>
                            : <><Plus style={{ width: 15, height: 15 }} /> Add to Form</>
                        }
                    </button>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text3)', marginTop: '0.75rem', marginBottom: 0 }}>
                    Ctrl+Enter to submit · Powered by Groq Llama 3.3
                </p>
            </div>
        </div>
    );
};

export default ExpandFormModal;
