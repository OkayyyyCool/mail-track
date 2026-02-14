import React, { useState, useEffect } from 'react';
import { type Rule } from '../types/Rule';
import RuleEditor from './RuleEditor';
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/list/list.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/list/list-item.js';

interface RulesProps {
    searchQuery: string;
}

const Rules: React.FC<RulesProps> = ({ searchQuery }) => {
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

    const handleDeleteRule = (ruleId: string) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            const updatedRules = rules.filter(r => r.id !== ruleId);
            saveRules(updatedRules);
        }
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
        const colors = ['bg-purple-pastel', 'bg-pink-pastel', 'bg-green-pastel', 'bg-blue-pastel'];
        return colors[index % colors.length];
    };

    const filteredRules = rules.filter(rule =>
        rule.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-content rules-container">
            <div style={{ marginBottom: '1rem' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredRules.map((rule, index) => (
                    <div key={rule.id} className={`rule-card ${getPastelClass(index)}`} style={{ position: 'relative', padding: '16px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 className="rule-title" style={{ margin: '0 0 8px 0', fontSize: '1.1rem', textTransform: 'capitalize' }}>
                                    {rule.tag.replace('_', ' ')}
                                </h3>
                                <p className="rule-desc" style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                                    {rule.description}
                                </p>
                                <div className="rule-meta" style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.6 }}>
                                    {rule.criteria.from ? `From: ${rule.criteria.from}` : (rule.criteria.subject || rule.criteria.includes)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <md-icon-button onClick={() => handleEditRule(rule)}>
                                    <md-icon>edit</md-icon>
                                </md-icon-button>
                                <md-icon-button onClick={() => handleDeleteRule(rule.id)}>
                                    <md-icon>delete</md-icon>
                                </md-icon-button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ position: 'fixed', bottom: '100px', right: '24px', zIndex: 90 }}>
                <md-fab variant="primary" onClick={handleAddRule}>
                    <md-icon slot="icon">add</md-icon>
                </md-fab>
            </div>

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
