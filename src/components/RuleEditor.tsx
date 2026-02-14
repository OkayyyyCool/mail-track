import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Tag, Type, Mail } from 'lucide-react';
import { type Rule } from '../types/Rule';

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
        { id: 'bg-blue-pastel', label: 'Blue', class: 'chip-blue' },
        { id: 'bg-green-pastel', label: 'Green', class: 'chip-green' },
        { id: 'bg-purple-pastel', label: 'Purple', class: 'chip-purple' },
        { id: 'bg-pink-pastel', label: 'Pink', class: 'chip-red' },
        { id: 'bg-orange-soft', label: 'Orange', class: 'chip-orange' },
    ];

    return (
        <div className="editor-overlay">
            <div className="editor-card">
                {/* Header */}
                {/* Header */}
                <div className="editor-header">
                    <button onClick={onCancel} className="icon-btn-plain">
                        <ArrowLeft size={24} />
                    </button>
                    <span className="editor-title">{initialRule ? 'Edit Rule' : 'New Rule'}</span>
                    <button className="icon-btn-plain">
                        <MoreVertical size={24} />
                    </button>
                </div>

                {/* Tag Name */}
                <label className="editor-label">Rule Name</label>
                <div className="input-group-row">
                    <div className="input-icon-circle">
                        <Tag size={16} />
                    </div>
                    <input
                        type="text"
                        className="editor-input"
                        placeholder="e.g. Interview"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                    />
                </div>

                {/* Description */}
                <div className="input-group-row">
                    <div className="input-icon-circle">
                        <Type size={16} />
                    </div>
                    <input
                        type="text"
                        className="editor-input"
                        placeholder="Short description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Theme Selection */}
                <label className="editor-label" style={{ marginTop: '16px' }}>Card Theme</label>
                <p className="editor-desc">Select a color for the rule card.</p>
                <div className="chips-row">
                    {colors.map(c => (
                        <button
                            key={c.id}
                            className={`chip-btn ${c.class} ${color === c.id ? 'active' : ''}`}
                            onClick={() => setColor(c.id)}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* Criteria Inputs */}
                <label className="editor-label">Match Conditions</label>
                <p className="editor-desc">Define what emails should be caught by this rule.</p>

                <div className="input-group-row">
                    <div className="input-icon-circle">
                        <Mail size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="input-label-small">Subject contains</div>
                        <input
                            type="text"
                            className="editor-input"
                            placeholder="e.g. Call Letter"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input-group-row">
                    <div className="input-icon-circle">
                        <Mail size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="input-label-small">Sender (From)</div>
                        <input
                            type="text"
                            className="editor-input"
                            placeholder="e.g. @iima.ac.in"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input-group-row">
                    <div className="input-icon-circle">
                        <Mail size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="input-label-small">Exclude Sender</div>
                        <input
                            type="text"
                            className="editor-input"
                            placeholder="e.g. noreply@spam.com"
                            value={excludeFrom}
                            onChange={(e) => setExcludeFrom(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input-group-row">
                    <div className="input-icon-circle">
                        <Type size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="input-label-small">Includes words</div>
                        <input
                            type="text"
                            className="editor-input"
                            placeholder="e.g. shortlist"
                            value={includes}
                            onChange={(e) => setIncludes(e.target.value)}
                        />
                    </div>
                </div>


                {/* Save Button */}
                <button className="save-btn" onClick={handleSave}>
                    {initialRule ? 'Update Rule' : 'Create Rule'}
                </button>
            </div>
        </div>
    );
};

export default RuleEditor;
