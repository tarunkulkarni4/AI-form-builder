import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Loader2, ListChecks, Calendar, Users, Zap, X, Brain, Wand2, Settings2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/* ── tiny floating particle ── */
const Particle = ({ style }) => (
    <div className="absolute rounded-full pointer-events-none"
        style={{ animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`, ...style }} />
);

/* ── animated gradient ring around icon ── */
const GlowRing = ({ children }) => (
    <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl"
            style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
                backgroundSize: '300% 300%',
                animation: 'border-rotate 3s linear infinite',
                padding: 2,
                borderRadius: 18,
                filter: 'blur(6px)',
                opacity: 0.8,
            }} />
        <div className="relative z-10 p-3 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {children}
        </div>
    </div>
);

const stepMeta = [
    { icon: Brain, label: 'Describe', color: '#6366f1' },
    { icon: Wand2, label: 'Select', color: '#8b5cf6' },
    { icon: Settings2, label: 'Configure', color: '#ec4899' },
];

const AIWizard = ({ onComplete, onCancel }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [prevStep, setPrevStep] = useState(1);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSections, setSelectedSections] = useState([]);
    const [finalConfig, setFinalConfig] = useState({ expiryDate: '', maxResponses: '', isPublic: true });
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [charCount, setCharCount] = useState(0);

    const goToStep = (n) => { setPrevStep(step); setStep(n); };

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

    const slideDir = step > prevStep ? 'slide-from-right' : 'slide-from-left';

    const inputStyle = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#f0f0ff',
        outline: 'none',
        fontFamily: 'Outfit, system-ui, sans-serif',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(3,3,15,0.88)', backdropFilter: 'blur(28px)' }}>

            {/* Animated ambient orbs */}
            <div className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'float-y 8s ease-in-out infinite' }} />
            <div className="absolute bottom-[20%] left-[8%] w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(30px)', animation: 'float-y 10s ease-in-out infinite', animationDelay: '2s' }} />

            {/* floating bg particles */}
            {[...Array(6)].map((_, i) => (
                <Particle key={i} style={{
                    width: 6 + i * 4, height: 6 + i * 4,
                    background: ['#6366f1', '#8b5cf6', '#ec4899', '#6366f1', '#8b5cf6', '#ec4899'][i],
                    opacity: 0.12 + i * 0.03,
                    top: `${8 + i * 15}%`,
                    left: `${4 + i * 17}%`,
                    animationDelay: `${i * 0.4}s`,
                }} />
            ))}

            {/* Conic glow border wrapper */}
            <div className="relative p-[1.5px] rounded-3xl w-full max-w-2xl" style={{ animation: 'anim-scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
                <div className="absolute inset-0 rounded-3xl"
                    style={{
                        background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
                        animation: 'rotate-gradient 4s linear infinite',
                        opacity: 0.5,
                        filter: 'blur(2px)',
                    }} />
                <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                        background: 'linear-gradient(145deg, #080818, #0f0f28)',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.06)',
                    }}>

                    {/* ── Header ── */}
                    <div className="relative overflow-hidden p-6"
                        style={{ background: 'linear-gradient(135deg, #1a1a3e 0%, #0f0f2a 100%)' }}>
                        {/* header orbs */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(16px)' }} />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <GlowRing>
                                    <Zap className="h-5 w-5 text-white" />
                                </GlowRing>
                                <div>
                                    <h2 className="text-lg font-black text-white">AI Form Wizard</h2>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                        Powered by Groq Llama 3.3
                                    </p>
                                </div>
                            </div>
                            <button onClick={onCancel}
                                className="p-2 rounded-xl transition-all hover:rotate-90"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* ── Step indicator ── */}
                        <div className="relative mt-6 flex items-center gap-0">
                            {stepMeta.map((s, i) => {
                                const num = i + 1;
                                const done = step > num;
                                const active = step === num;
                                const Icon = s.icon;
                                return (
                                    <React.Fragment key={num}>
                                        <div className="flex flex-col items-center gap-1" style={{ flex: 'none' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500"
                                                style={{
                                                    background: done ? 'linear-gradient(135deg, #10b981, #059669)' : active ? `linear-gradient(135deg, #6366f1, #8b5cf6)` : 'rgba(255,255,255,0.06)',
                                                    border: active ? '2px solid rgba(139,92,246,0.5)' : '2px solid transparent',
                                                    boxShadow: active ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
                                                    transform: active ? 'scale(1.12)' : 'scale(1)',
                                                }}>
                                                {done
                                                    ? <CheckCircle2 className="h-5 w-5 text-white" />
                                                    : <Icon className="h-4 w-4" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                                                }
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider transition-all"
                                                style={{ color: active ? '#a5b4fc' : done ? '#6ee7b7' : 'rgba(255,255,255,0.25)' }}>
                                                {s.label}
                                            </span>
                                        </div>
                                        {i < stepMeta.length - 1 && (
                                            <div className="flex-1 mx-2 h-0.5 rounded-full overflow-hidden transition-all duration-700"
                                                style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: step > num ? '100%' : '0%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Content ── */}
                    <div className="p-6 min-h-[360px]" key={step}
                        style={{ animation: `${slideDir} 0.35s cubic-bezier(0.22, 1, 0.36, 1) both` }}>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Brain className="h-4 w-4 text-indigo-400" />
                                        <h3 className="text-base font-bold text-white">Describe your form</h3>
                                    </div>
                                    <p className="text-xs italic mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                        e.g. "Create a donation form for an NGO with donor details and payment proof."
                                    </p>
                                    <div className="relative">
                                        <textarea
                                            value={prompt}
                                            onChange={e => { setPrompt(e.target.value); setCharCount(e.target.value.length); }}
                                            placeholder="Describe your form in detail..."
                                            rows={4}
                                            className="w-full p-4 rounded-2xl resize-none text-sm transition-all focus:ring-2 focus:ring-indigo-500"
                                            style={{ ...inputStyle, paddingBottom: 32 }}
                                        />
                                        <div className="absolute bottom-3 right-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                            {charCount} chars
                                        </div>
                                    </div>
                                </div>

                                {/* Example chips */}
                                <div>
                                    <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Try an example:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'Job application for a software company',
                                            'Customer feedback survey',
                                            'Event registration form',
                                        ].map(ex => (
                                            <button key={ex} onClick={() => { setPrompt(ex); setCharCount(ex.length); }}
                                                className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
                                                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                                                {ex}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Analyze Button ── */}
                                <div className="relative mt-2">
                                    {/* Pulsing ring behind button */}
                                    {!loading && prompt && (
                                        <div className="absolute inset-0 rounded-2xl animate-pulse-glow pointer-events-none"
                                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', opacity: 0.3, filter: 'blur(12px)' }} />
                                    )}
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={!prompt || loading}
                                        className="relative w-full rounded-2xl font-bold text-white overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 hover:scale-[1.02] active:scale-[0.98]"
                                        style={{
                                            background: loading
                                                ? 'rgba(99,102,241,0.5)'
                                                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
                                            backgroundSize: '200% auto',
                                            animation: !loading && prompt ? 'shimmer 2.5s linear infinite' : 'none',
                                            padding: '18px 24px',
                                            boxShadow: prompt && !loading ? '0 10px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3)' : 'none',
                                        }}>
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span className="text-base">Analyzing with Groq AI...</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-3">
                                                <Sparkles className="h-5 w-5 flex-shrink-0"
                                                    style={{ animation: prompt ? 'float 1.8s ease-in-out infinite' : 'none' }} />
                                                <span className="text-base">Analyze with Groq AI</span>
                                                <ArrowRight className="h-5 w-5 flex-shrink-0" />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wand2 className="h-4 w-4 text-violet-400" />
                                        <h3 className="text-base font-bold text-white">Select Sections</h3>
                                    </div>
                                    <button
                                        onClick={() =>
                                            selectedSections.length === suggestions.length
                                                ? setSelectedSections([])
                                                : setSelectedSections(suggestions.map(s => s.id))
                                        }
                                        className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105"
                                        style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                                        {selectedSections.length === suggestions.length ? '✕ Deselect All' : '✓ Select All'}
                                    </button>
                                </div>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    Groq AI suggested {suggestions.length} sections — pick what you need.
                                </p>

                                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scroll">
                                    {suggestions.map((s, i) => {
                                        const selected = selectedSections.includes(s.id);
                                        return (
                                            <div key={s.id} onClick={() => toggleSection(s.id)}
                                                className="p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                                                style={{
                                                    animation: `slide-from-right 0.3s ease both`,
                                                    animationDelay: `${i * 60}ms`,
                                                    background: selected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${selected ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.07)'}`,
                                                    boxShadow: selected ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
                                                }}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-sm text-white">{s.title}</h4>
                                                    <div className="flex-shrink-0 ml-2">
                                                        {selected
                                                            ? <CheckCircle2 className="h-5 w-5 text-indigo-400" style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.6))' }} />
                                                            : <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                                                        }
                                                    </div>
                                                </div>
                                                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.description}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {s.suggestedFields.map(f => (
                                                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-full"
                                                            style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button onClick={() => goToStep(1)}
                                        className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-white/5"
                                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                                        ← Back
                                    </button>
                                    <button onClick={handleNextStep}
                                        className="flex-[2] py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shimmer-btn">
                                        Next Step <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Settings2 className="h-4 w-4 text-pink-400" />
                                    <h3 className="text-base font-bold text-white">Final Touches</h3>
                                </div>

                                {/* Selected pill */}
                                <div className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
                                    <ListChecks className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        <span className="font-bold text-indigo-400">{selectedSections.length} sections</span> selected · ~{selectedSections.length * 3} questions
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Form Title */}
                                    <div className="col-span-2">
                                        <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            📝 Form Title
                                        </label>
                                        <input type="text"
                                            placeholder={prompt.substring(0, 50) || 'Enter form title...'}
                                            value={formTitle}
                                            onChange={e => setFormTitle(e.target.value)}
                                            className="w-full p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                            style={inputStyle} />
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-2">
                                        <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            📄 Description <span className="font-normal opacity-50">(shown below title in Google Form)</span>
                                        </label>
                                        <textarea
                                            placeholder="e.g. Created by XYZ Company for internal feedback..."
                                            value={formDescription}
                                            onChange={e => setFormDescription(e.target.value)}
                                            rows={2}
                                            className="w-full p-3 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            style={inputStyle} />
                                    </div>

                                    {/* Expiry */}
                                    <div>
                                        <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            <Calendar className="h-3.5 w-3.5" /> Expiry Date
                                        </label>
                                        <input type="date" value={finalConfig.expiryDate}
                                            onChange={e => setFinalConfig({ ...finalConfig, expiryDate: e.target.value })}
                                            className="w-full p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                            style={inputStyle} />
                                    </div>

                                    {/* Max Responses */}
                                    <div>
                                        <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            <Users className="h-3.5 w-3.5" /> Response Limit
                                        </label>
                                        <input type="number" placeholder="e.g. 100" value={finalConfig.maxResponses}
                                            onChange={e => setFinalConfig({ ...finalConfig, maxResponses: e.target.value })}
                                            className="w-full p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                            style={inputStyle} />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button onClick={() => goToStep(2)}
                                        className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-white/5"
                                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                                        ← Back
                                    </button>
                                    <button onClick={handleCreateForm} disabled={loading}
                                        className="flex-[2] py-3.5 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                        style={{
                                            background: loading ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #059669)',
                                            boxShadow: loading ? 'none' : '0 8px 30px rgba(16,185,129,0.3), 0 0 0 1px rgba(16,185,129,0.2)',
                                        }}>
                                        {loading
                                            ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating Form...</>
                                            : <><Sparkles className="h-5 w-5" /> Generate Google Form</>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIWizard;
