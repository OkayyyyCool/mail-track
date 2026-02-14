import React, { useState } from 'react';
import { type Rule } from '../types/Rule';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/radio/radio.js';

interface RuleEditorProps {
    initialRule?: Rule;
    onSave: (rule: Rule) => void;
    onCancel: () => void;
}

const RuleEditor: React.FC<RuleEditorProps> = ({ initialRule, onSave, onCancel }) => {
    const [tag, setTag] = useState(initialRule?.tag || '');
    const [description, setDescription] = useState(initialRule?.description || '');

    // Criteria
    const [subject, setSubject] = useState(initialRule?.criteria.subject || '');
    const [from, setFrom] = useState(initialRule?.criteria.from || '');
    const [includes, setIncludes] = useState(initialRule?.criteria.includes || '');
    const [excludeFrom, setExcludeFrom] = useState(initialRule?.criteria.excludeFrom || '');

    // Color Theme
    const [color, setColor] = useState(initialRule?.color || 'bg-blue-pastel');

    const handleSave = () => {
        const newRule: Rule = {
            id: initialRule?.id || Date.now().toString(),
            tag: tag || 'New Rule',
            description: description || 'Custom Rule',
            criteria: {
                subject: subject || undefined,
                from: from || undefined,
                includes: includes || undefined,
                excludeFrom: excludeFrom || undefined
            },
            color,
            isActive: true
        };
        onSave(newRule);
    };

    const colors = [
        { id: 'bg-blue-pastel', label: 'Blue', bg: '#E3F2FD', accent: '#2196F3' },
        { id: 'bg-green-pastel', label: 'Green', bg: '#E8F5E9', accent: '#4CAF50' },
        { id: 'bg-purple-pastel', label: 'Purple', bg: '#ede7f6', accent: '#673ab7' },
        { id: 'bg-pink-pastel', label: 'Pink', bg: '#FCE4EC', accent: '#E91E63' },
        { id: 'bg-orange-soft', label: 'Orange', bg: '#fff3e0', accent: '#ff9800' },
    ];

    // Helper to handle input changes for Web Components
    const handleInput = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.FormEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement;
        setter(target.value);
    };

    return (
        <div className="editor-overlay">
            <div className="editor-card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '28px' }}>
                {/* Header */}
                <div className="editor-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="editor-title" style={{ margin: 0, fontSize: '1.5rem' }}>{initialRule ? 'Edit Rule' : 'New Rule'}</h2>
                    <md-icon-button onClick={onCancel}>
                        <md-icon>close</md-icon>
                    </md-icon-button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Tag Name */}
                    <md-outlined-text-field
                        label="Rule Name"
                        placeholder="e.g. Interview"
                        value={tag}
                        onInput={handleInput(setTag)}
                        style={{ width: '100%', '--md-outlined-text-field-container-shape': '16px' } as React.CSSProperties}
                    />

                    {/* Description */}
                    <md-outlined-text-field
                        label="Description"
                        placeholder="Short description"
                        value={description}
                        onInput={handleInput(setDescription)}
                        style={{ width: '100%', '--md-outlined-text-field-container-shape': '16px' } as React.CSSProperties}
                    />

                    {/* Theme Selection */}
                    <div>
                        <label className="editor-label" style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Card Theme</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                            {colors.map(c => (
                                <label
                                    key={c.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {/* @ts-ignore */}
                                    <md-radio
                                        name="card-theme"
                                        value={c.id}
                                        checked={color === c.id ? true : undefined}
                                        onClick={() => setColor(c.id)}
                                        style={{
                                            '--md-radio-icon-color': c.accent,
                                            '--md-radio-selected-icon-color': c.accent,
                                            '--md-radio-hover-icon-color': c.accent,
                                            '--md-radio-focus-icon-color': c.accent,
                                            '--md-radio-pressed-icon-color': c.accent,
                                            '--md-radio-icon-size': '24px',
                                        } as React.CSSProperties}
                                    />
                                    <span style={{ fontSize: '0.7rem', color: c.accent, fontWeight: 500, opacity: color === c.id ? 1 : 0.7 }}>{c.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <md-divider />

                    {/* Criteria Inputs */}
                    <h3 style={{ fontSize: '1.1rem', margin: '8px 0' }}>Match Conditions</h3>

                    <md-outlined-text-field
                        label="Subject contains"
                        placeholder="e.g. Call Letter"
                        value={subject}
                        onInput={handleInput(setSubject)}
                        style={{ width: '100%', '--md-outlined-text-field-container-shape': '16px' } as React.CSSProperties}
                    />

                    <md-outlined-text-field
                        label="Sender (From)"
                        placeholder="e.g. @iima.ac.in"
                        value={from}
                        onInput={handleInput(setFrom)}
                        style={{ width: '100%', '--md-outlined-text-field-container-shape': '16px' } as React.CSSProperties}
                    />

                    <md-outlined-text-field
                        label="Includes words"
                        placeholder="e.g. shortlist"
                        value={includes}
                        onInput={handleInput(setIncludes)}
                        style={{ width: '100%', '--md-outlined-text-field-container-shape': '16px' } as React.CSSProperties}
                    />

                    <md-outlined-text-field
                        label="Exclude Sender"
                        placeholder="e.g. noreply@spam.com"
                        value={excludeFrom}
                        onInput={handleInput(setExcludeFrom)}
                        style={{ width: '100%', '--md-outlined-text-field-container-shape': '16px' } as React.CSSProperties}
                        error={false}
                        supporting-text="Emails from this sender will be hidden"
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <md-text-button onClick={onCancel}>Cancel</md-text-button>
                        <md-filled-button onClick={handleSave}>
                            {initialRule ? 'Update' : 'Create'}
                        </md-filled-button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RuleEditor;
