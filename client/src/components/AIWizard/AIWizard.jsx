import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Loader2, ListChecks, Calendar, Zap, X, Brain, Wand2, Settings2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const stepMeta = [
    { icon: Brain, label: 'Describe', color: '#6366f1' },
    { icon: Wand2, label: 'Select', color: '#8b5cf6' },
    { icon: Settings2, label: 'Configure', color: '#ec4899' },
];

const AIWizard = ({ onComplete, onCancel }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSections, setSelectedSections] = useState([]);
    const [finalConfig, setFinalConfig] = useState({ expiryDate: '', isPublic: true });
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [charCount, setCharCount] = useState(0);

    const goToStep = (n) => { setStep(n); };

    const handleAnalyze = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const { data } = await api.post('/ai/analyze', { prompt });
            setSuggestions(data);
            goToStep(2);
        } catch (error) {
            showToast(error.response?.data?.message || 'AI Analysis failed. Please try again.', 'error');
        } finally { setLoading(false); }
    };

    const toggleSection = (id) =>
        setSelectedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

    const handleNextStep = () => {
        if (step === 2 && selectedSections.length === 0) {
            showToast('Please select at least one section.', 'warning');
            return;
        }
        goToStep(step + 1);
    };

    const handleCreateForm = async () => {
        setLoading(true);
        try {
            const { data: aiResponse } = await api.post('/ai/generate', {
                prompt,
                sections: suggestions.filter(s => selectedSections.includes(s.id))
            });
            const { data: newForm } = await api.post('/form/create', {
                title: formTitle || prompt.substring(0, 50),
                description: formDescription,
                requests: aiResponse.requests,
                config: finalConfig,
                userId: user?._id
            });
            await onComplete(newForm);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create form. Please try again.', 'error');
        } finally { setLoading(false); }
    };

    const inputStyle = {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        outline: 'none',
        fontFamily: 'Outfit, system-ui, sans-serif',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>

            {/* Main Modal Container */}
            <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
                style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                }}>

                {/* ── Header ── */}
                <div className="p-6" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl" style={{ background: 'var(--accent)', color: '#fff' }}>
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black" style={{ color: 'var(--text)' }}>AI Form Wizard</h2>
                                <p className="text-xs" style={{ color: 'var(--text2)' }}>
                                    Powered by Groq Llama 3.3
                                </p>
                            </div>
                        </div>
                        <button onClick={onCancel}
                            className="p-2 rounded-xl text-[var(--text2)] hover:bg-[var(--surface2)]">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* ── Step indicator ── */}
                    <div className="mt-8 flex items-center">
                        {stepMeta.map((s, i) => {
                            const num = i + 1;
                            const done = step > num;
                            const active = step === num;
                            const Icon = s.icon;
                            return (
                                <React.Fragment key={num}>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors"
                                            style={{
                                                background: active ? 'var(--accent)' : done ? 'var(--success)' : 'transparent',
                                                borderColor: active ? 'var(--accent)' : done ? 'var(--success)' : 'var(--border)',
                                            }}>
                                            {done
                                                ? <CheckCircle2 className="h-5 w-5 text-white" />
                                                : <Icon className="h-4 w-4" style={{ color: active ? '#fff' : 'var(--text3)' }} />
                                            }
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color: active ? 'var(--accent)' : done ? 'var(--success)' : 'var(--text3)' }}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < stepMeta.length - 1 && (
                                        <div className="flex-1 mx-2 h-0.5 rounded-full" style={{ background: 'var(--border)' }}>
                                            <div className="h-full rounded-full transition-all"
                                                style={{ width: step > num ? '100%' : '0%', background: 'var(--accent)' }} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="p-6 min-h-[360px]">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                                    <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Describe your form</h3>
                                </div>
                                <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
                                    e.g. "Create a donation form for an NGO with donor details and payment proof."
                                </p>
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={e => { setPrompt(e.target.value); setCharCount(e.target.value.length); }}
                                        placeholder="Describe your form in detail..."
                                        rows={4}
                                        className="w-full p-4 rounded-2xl resize-none text-sm focus:border-[var(--accent)] outline-none"
                                        style={inputStyle}
                                    />
                                    <div className="absolute bottom-3 right-4 text-xs" style={{ color: 'var(--text3)' }}>
                                        {charCount} chars
                                    </div>
                                </div>
                            </div>

                            {/* Example chips */}
                            <div>
                                <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--text3)' }}>Try an example:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'Job application for a software company',
                                        'Customer feedback survey',
                                        'Event registration form',
                                    ].map(ex => (
                                        <button key={ex} onClick={() => { setPrompt(ex); setCharCount(ex.length); }}
                                            className="text-xs px-4 py-2 rounded-full border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                                            style={{ background: 'var(--surface)' }}>
                                            {ex}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!prompt || loading}
                                className="w-full btn-primary py-4 text-base disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Analyzing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Analyze with AI <ArrowRight className="h-5 w-5" />
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wand2 className="h-4 w-4" style={{ color: 'var(--accent2)' }} />
                                    <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Select Sections</h3>
                                </div>
                                <button
                                    onClick={() =>
                                        selectedSections.length === suggestions.length
                                            ? setSelectedSections([])
                                            : setSelectedSections(suggestions.map(s => s.id))
                                    }
                                    className="text-xs font-bold px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--accent)]"
                                    style={{ color: 'var(--accent)' }}>
                                    {selectedSections.length === suggestions.length ? '✕ Deselect All' : '✓ Select All'}
                                </button>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text2)' }}>
                                AI suggested {suggestions.length} sections — pick what you need.
                            </p>

                            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2 custom-scroll">
                                {suggestions.map((s) => {
                                    const selected = selectedSections.includes(s.id);
                                    return (
                                        <div key={s.id} onClick={() => toggleSection(s.id)}
                                            className="p-4 rounded-xl cursor-pointer border-2 transition-colors"
                                            style={{
                                                background: selected ? 'var(--accent-glow)' : 'var(--surface)',
                                                borderColor: selected ? 'var(--accent)' : 'var(--border)',
                                            }}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{s.title}</h4>
                                                {selected && <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />}
                                            </div>
                                            <p className="text-xs mb-2" style={{ color: 'var(--text2)' }}>{s.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {s.suggestedFields.map(f => (
                                                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface2)] border border-[var(--border)]"
                                                        style={{ color: 'var(--text2)' }}>
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => goToStep(1)}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm border border-[var(--border)] hover:bg-[var(--surface2)]">
                                    ← Back
                                </button>
                                <button onClick={handleNextStep} className="flex-[2] btn-primary py-3">
                                    Next Step <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Settings2 className="h-4 w-4" style={{ color: 'var(--accent3)' }} />
                                <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Final Touches</h3>
                            </div>

                            <div className="p-3 rounded-xl border border-[var(--accent)] bg-[var(--accent-glow)] flex items-center gap-3">
                                <ListChecks className="h-4 w-4 text-[var(--accent)]" />
                                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                                    {selectedSections.length} sections selected
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text2)]">Form Title</label>
                                    <input type="text"
                                        placeholder={prompt.substring(0, 50) || 'Enter form title...'}
                                        value={formTitle}
                                        onChange={e => setFormTitle(e.target.value)}
                                        className="w-full p-3 rounded-xl text-sm focus:border-[var(--accent)] outline-none"
                                        style={inputStyle} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text2)]">Description</label>
                                    <textarea
                                        placeholder="e.g. Created by XYZ Company for internal feedback..."
                                        value={formDescription}
                                        onChange={e => setFormDescription(e.target.value)}
                                        rows={2}
                                        className="w-full p-3 rounded-xl text-sm resize-none focus:border-[var(--accent)] outline-none"
                                        style={inputStyle} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text2)]">Expiry Date (Optional)</label>
                                    <input type="date" value={finalConfig.expiryDate}
                                        onChange={e => setFinalConfig({ ...finalConfig, expiryDate: e.target.value })}
                                        className="w-full p-3 rounded-xl text-sm focus:border-[var(--accent)] outline-none"
                                        style={inputStyle} />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => goToStep(2)}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm border border-[var(--border)] hover:bg-[var(--surface2)]">
                                    ← Back
                                </button>
                                <button onClick={handleCreateForm} disabled={loading} className="flex-[2] btn-primary py-3">
                                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating...</> : 'Generate Google Form'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIWizard;
