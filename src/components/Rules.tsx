import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { type Rule } from '../types/Rule';
import RuleEditor from './RuleEditor';

const Rules: React.FC = () => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRule, setCurrentRule] = useState<Rule | undefined>(undefined);

    // Initial Data
    const standardRules: Rule[] = [
        { id: '1', description: 'Subject or Body contains "interview"', criteria: { includes: 'interview' }, tag: 'interview', color: 'bg-orange-soft', isActive: true },
        { id: '2', description: 'Subject contains "call letter" or "admit card"', criteria: { subject: 'call letter OR admit card' }, tag: 'call_letter', color: 'bg-green-soft', isActive: true },
        { id: '3', description: 'Subject contains "test" or "assessment"', criteria: { subject: 'test OR assessment' }, tag: 'test', color: 'bg-red-soft', isActive: true },
        { id: '4', description: 'Subject contains "shortlist"', criteria: { subject: 'shortlist' }, tag: 'shortlist', color: 'bg-blue-soft', isActive: true },
    ];

    useEffect(() => {
        const savedRules = localStorage.getItem('rules');
        if (savedRules) {
            setRules(JSON.parse(savedRules));
        } else {
            setRules(standardRules);
            localStorage.setItem('rules', JSON.stringify(standardRules));
        }
    }, []);

    const saveRules = (newRules: Rule[]) => {
        setRules(newRules);
        localStorage.setItem('rules', JSON.stringify(newRules));
    };

    const handleAddRule = () => {
        setCurrentRule(undefined);
        setIsEditing(true);
    };

    const handleEditRule = (rule: Rule) => {
        setCurrentRule(rule);
        setIsEditing(true);
    };

    const handleSave = (rule: Rule) => {
        let updatedRules;
        if (currentRule) {
            // Edit existing
            updatedRules = rules.map(r => r.id === rule.id ? rule : r);
        } else {
            // Add new
            updatedRules = [...rules, rule];
        }
        saveRules(updatedRules);
        setIsEditing(false);
    };

    const getPastelClass = (index: number) => {
        // Cycle through pastel colors based on index or tag
        const colors = ['bg-purple-pastel', 'bg-pink-pastel', 'bg-green-pastel', 'bg-blue-pastel'];
        return colors[index % colors.length];
    };

    return (
        <div className="dashboard-content rules-container">
            {/* Header removed as per previous request */}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {rules.map((rule, index) => (
                    <div key={rule.id} className="rule-row">
                        {/* Card */}
                        <div className={`rule-card ${getPastelClass(index)}`}>
                            {/* Floating "Window" content */}
                            <h3 className="rule-title">{rule.tag.replace('_', ' ')}</h3>

                            <p className="rule-desc">{rule.description}</p>

                            <div className="rule-meta">
                                {rule.criteria.from ? `From: ${rule.criteria.from}` : (rule.criteria.subject || rule.criteria.includes)}
                            </div>
                        </div>

                        {/* Edit Button Outside */}
                        <button onClick={() => handleEditRule(rule)} className="rule-edit-btn-outside">
                            <Edit2 size={20} color="#1D1D1D" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Floating Action Button */}
            <button className="fab-add" onClick={handleAddRule} title="Add New Rule">
                <Plus size={32} />
            </button>

            {isEditing && (
                <RuleEditor
                    initialRule={currentRule}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                />
            )}
        </div>
    );
};

export default Rules;
