import React, { useState } from 'react';
import { X, Zap, FileText, Star, Briefcase, Heart, GraduationCap, ShoppingBag, Users, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TEMPLATES = [
    {
        id: 'customer_feedback',
        icon: Star, color: '#f59e0b',
        title: 'Customer Feedback',
        description: 'Collect product ratings, satisfaction scores, and improvement ideas',
        prompt: 'Create a customer feedback survey to collect product/service ratings, overall satisfaction, what customers liked, areas for improvement, and likelihood to recommend.',
        sections: ['Overall Satisfaction', 'Product Experience', 'Support Quality', 'Net Promoter Score'],
    },
    {
        id: 'event_rsvp',
        icon: Users, color: '#6366f1',
        title: 'Event RSVP',
        description: 'Manage attendance, meals, and guest details for your event',
        prompt: 'Create an event RSVP form with attendee name, email, attendance confirmation, meal preferences, dietary restrictions, and any special accommodations needed.',
        sections: ['Contact Details', 'Attendance', 'Meal Preferences', 'Special Requirements'],
    },
    {
        id: 'job_application',
        icon: Briefcase, color: '#8b5cf6',
        title: 'Job Application',
        description: 'Screen candidates with experience, skills, and availability questions',
        prompt: 'Create a job application form asking for applicant personal details, work experience, technical skills, education background, availability, and why they are interested in the position.',
        sections: ['Personal Info', 'Work Experience', 'Skills', 'Education', 'Availability'],
    },
    {
        id: 'health_survey',
        icon: Heart, color: '#ef4444',
        title: 'Health & Wellness Survey',
        description: 'Assess lifestyle habits, exercise routines, and wellness goals',
        prompt: 'Create a health and wellness survey asking about daily exercise habits, diet and nutrition, sleep patterns, stress levels, mental health, and wellness goals.',
        sections: ['Physical Activity', 'Nutrition', 'Sleep', 'Mental Wellness', 'Goals'],
    },
    {
        id: 'course_feedback',
        icon: GraduationCap, color: '#10b981',
        title: 'Course / Training Feedback',
        description: 'Evaluate learning quality, instructor effectiveness, and content clarity',
        prompt: 'Create a course feedback form asking about content quality, instructor effectiveness, pace of delivery, usefulness of materials, most valuable topics, and overall rating.',
        sections: ['Content Quality', 'Instructor', 'Learning Materials', 'Overall Experience'],
    },
    {
        id: 'order_form',
        icon: ShoppingBag, color: '#ec4899',
        title: 'Product Order Form',
        description: 'Collect product selections, quantities, and delivery information',
        prompt: 'Create a product order form asking for customer name, contact email, product selection, quantity, delivery address, and preferred payment method.',
        sections: ['Customer Details', 'Product Selection', 'Delivery Info', 'Payment'],
    },
];

const TemplatesModal = ({ onClose, onComplete }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [creating, setCreating] = useState(null); // template id being created

    const handleUseTemplate = async (template) => {
        setCreating(template.id);
        try {
            // Step 1: Generate form structure from template sections
            const { data: structureData } = await api.post('/ai/generate', {
                prompt: template.prompt,
                sections: template.sections.map(s => ({ id: s.toLowerCase().replace(/\s+/g, '_'), title: s })),
            });

            // Step 2: Create the Google Form
            const { data: formData } = await api.post('/form/create', {
                title: template.title,
                description: template.description,
                requests: structureData.requests,
                config: { isPublic: true },
                userId: user._id,
            });

            showToast(`✅ "${template.title}" form created!`, 'success');
            onComplete(formData);
            onClose();
        } catch (err) {
            console.error('Template error:', err);
            showToast(err.response?.data?.message || 'Failed to create template form.', 'error');
        } finally {
            setCreating(null);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem', overflowY: 'auto',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: 'var(--bg2, #0d0d22)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '2rem',
                width: '100%', maxWidth: '640px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Zap style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>Form Templates</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text2)', margin: 0 }}>
                            Pick a template — AI builds the full form instantly
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '8px', padding: '6px', cursor: 'pointer',
                        color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <X style={{ width: 16, height: 16 }} />
                    </button>
                </div>

                {/* Template Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
                    {TEMPLATES.map(t => {
                        const Icon = t.icon;
                        const isLoading = creating === t.id;
                        return (
                            <button key={t.id} onClick={() => handleUseTemplate(t)} disabled={!!creating}
                                style={{
                                    background: 'var(--surface)', border: '1px solid var(--border)',
                                    borderRadius: '16px', padding: '1.25rem',
                                    cursor: creating ? 'not-allowed' : 'pointer',
                                    textAlign: 'left', transition: 'all 0.2s ease',
                                    opacity: creating && !isLoading ? 0.5 : 1,
                                }}
                                onMouseEnter={e => { if (!creating) { e.currentTarget.style.borderColor = t.color + '60'; e.currentTarget.style.background = t.color + '0d'; } }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '10px',
                                        background: t.color + '18', border: `1px solid ${t.color}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {isLoading
                                            ? <Loader2 className="animate-spin" style={{ width: 16, height: 16, color: t.color }} />
                                            : <Icon style={{ width: 16, height: 16, color: t.color }} />
                                        }
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{t.title}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.5 }}>{t.description}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.75rem' }}>
                                    {t.sections.slice(0, 3).map(s => (
                                        <span key={s} style={{
                                            fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px',
                                            borderRadius: '99px', background: t.color + '14',
                                            color: t.color, border: `1px solid ${t.color}25`,
                                        }}>{s}</span>
                                    ))}
                                    {t.sections.length > 3 && (
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>+{t.sections.length - 3} more</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TemplatesModal;
