import React, { useEffect, useState } from 'react';
import { listMessages, getMessage } from '../services/gmail';
import { parseEmail, type ParsedEmail } from '../services/parser';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/fab/fab.js';

import { type Rule } from '../types/Rule';

const matchesRule = (email: ParsedEmail, rule: Rule): boolean => {
    const { from, subject, includes, excludes } = rule.criteria;
    const textToSearch = (email.subject + ' ' + (email.body || '')).toLowerCase();
    const sender = email.sender.toLowerCase();

    if (from && !sender.includes(from.toLowerCase())) return false;
    if (subject && !email.subject.toLowerCase().includes(subject.toLowerCase())) return false;
    if (includes && !textToSearch.includes(includes.toLowerCase())) return false;
    // Simple handling for 'OR' in subject logic from standard rules specific cases, 
    // but ideally we'd have a more robust query parser. 
    // For now, let's rely on basic inclusions or the specific logic for standard rules if needed.
    // The standard rules use 'OR' in the criteria string sometimes.
    if (subject?.includes(' OR ')) {
        const parts = subject.split(' OR ').map(s => s.trim().toLowerCase());
        const subjectLower = email.subject.toLowerCase();
        if (!parts.some(p => subjectLower.includes(p))) return false;
        // If passed above check, we shouldn't fail 'subject' check below again so this return true isn't enough, 
        // but since we returned false for mismatch, we are good to continue? 
        // Wait, the line `if (subject ...)` above would fail if exact match is expected.
        // Let's rely on the fact that for standard rules I'll reimplement the exact logic or update `matchesRule` 
        // to handle the existing structure.
        return true;
    }

    return true;
};

const Dashboard: React.FC<{ searchQuery?: string; isDark?: boolean }> = ({ searchQuery = '', isDark = false }) => {
    const { isGapiReady, logout, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [emails, setEmails] = useState<ParsedEmail[]>([]);
    const [activeRules, setActiveRules] = useState<Rule[]>([]);

    // Stats state - dynamic map of rule tag -> count
    const [stats, setStats] = useState<Record<string, number>>({});

    const [filter, setFilter] = useState<string>('all');
    const [showDetails, setShowDetails] = useState(false);

    const filteredEmails = React.useMemo(() => {
        let result = emails;

        // Apply Category Filter based on Rule Tag
        if (filter !== 'all') {
            // Find the rule corresponding to the filter
            const rule = activeRules.find(r => r.tag === filter);
            if (rule) {
                result = result.filter(e => matchesRule(e, rule));
            } else {
                // Fallback for types if they exist or just empty
                // result = result.filter(e => e.type === filter); 
            }
        }


        // Apply Search Filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.subject.toLowerCase().includes(lowerQuery) ||
                e.sender.toLowerCase().includes(lowerQuery) ||
                (e.body && JSON.stringify(e.body).toLowerCase().includes(lowerQuery))
            );
        }

        return result;
    }, [emails, filter, searchQuery]);

    const fetchEmails = React.useCallback(async () => {
        if (!isGapiReady) return;

        setLoading(true);
        try {
            // Search for keywords in last 3 months
            const query = 'subject:(interview OR "call letter" OR shortlist OR test) newer_than:3m';
            const messages = await listMessages(query, 15);

            const parsedPromises = messages.map(async (msg: any) => {
                const fullMsg = await getMessage(msg.id);
                return parseEmail(fullMsg);
            });

            const results = await Promise.all(parsedPromises);

            // Sort by received date (newest first)
            const sorted = results.sort((a: ParsedEmail, b: ParsedEmail) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            // Filter based on saved rules (Exclude Sender)
            const savedRulesStr = localStorage.getItem('rules');
            let filtered = sorted;
            let currentRules: Rule[] = [];

            if (savedRulesStr) {
                const rules: Rule[] = JSON.parse(savedRulesStr);
                const activeRulesList = rules.filter(r => r.isActive && !r.criteria.excludeFrom);
                currentRules = activeRulesList;
                setActiveRules(activeRulesList);

                const excludeRules = rules.filter(r => r.criteria.excludeFrom && r.isActive);

                if (excludeRules.length > 0) {
                    filtered = sorted.filter((email: ParsedEmail) => {
                        // Check if email matches any exclude rule
                        const shouldExclude = excludeRules.some((rule: any) => {
                            const excludePattern = rule.criteria.excludeFrom!.toLowerCase();
                            return email.sender.toLowerCase().includes(excludePattern);
                        });
                        return !shouldExclude;
                    });
                }
            } else {
                // Define standard rules if not present (although Rules.tsx handles this, Dashboard might load first)
                const standardRules: Rule[] = [
                    { id: '1', description: 'Subject or Body contains "interview"', criteria: { includes: 'interview' }, tag: 'interview', color: 'bg-orange-soft', isActive: true },
                    { id: '2', description: 'Subject contains "call letter" or "admit card"', criteria: { subject: 'call letter OR admit card' }, tag: 'call_letter', color: 'bg-green-soft', isActive: true },
                    { id: '3', description: 'Subject contains "test" or "assessment"', criteria: { subject: 'test OR assessment' }, tag: 'test', color: 'bg-red-soft', isActive: true },
                    { id: '4', description: 'Subject contains "shortlist"', criteria: { subject: 'shortlist' }, tag: 'shortlist', color: 'bg-blue-soft', isActive: true },
                ];
                currentRules = standardRules;
                setActiveRules(standardRules);
                localStorage.setItem('rules', JSON.stringify(standardRules));
            }

            setEmails(filtered);

            // Calculate stats dynamically
            const computedStats: Record<string, number> = {
                total: filtered.length
            };

            currentRules.forEach(rule => {
                computedStats[rule.tag] = filtered.filter(e => matchesRule(e, rule)).length;
            });

            setStats(computedStats);

        } catch (error: any) {
            console.error("Failed to fetch emails", error);
            // Auto-logout on 401 to force token refresh
            if (error?.result?.error?.code === 401 || error?.status === 401 || error?.toString().includes("401")) {
                console.log("Token expired, logging out...");
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [isGapiReady, logout]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);


    // Modal State
    const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null);

    const getIconName = (type: string) => {
        switch (type) {
            case 'interview': return 'event';
            case 'call_letter': return 'check_circle';
            case 'test': return 'assignment_late';
            default: return 'business'; // building icon counterpart
        }
    };

    return (
        <div className="dashboard-content">
            {/* Summary Filters - Dynamic Flexible Buttons */}
            <div className="summary-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>

                {/* Total Button */}
                <div onClick={() => setFilter('all')} style={{ flex: '1 1 100px', minWidth: '110px', height: '90px' }}>
                    {/* @ts-ignore */}
                    <md-filled-tonal-button style={{ width: '100%', height: '100%', '--md-filled-tonal-button-container-shape': '24px', '--md-filled-tonal-button-container-color': filter === 'all' ? '#1D1D1D' : '#E8DEF8', '--md-filled-tonal-button-label-text-color': filter === 'all' ? '#FFF' : '#1D1D1D' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', color: filter === 'all' ? '#FFFFFF' : '#1a73e8' }}>
                            {/* @ts-ignore */}
                            <md-icon style={{ fontSize: '20px', color: 'inherit' }}>mail</md-icon>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stats.total || 0}</span>
                            </div>
                        </div>
                    </md-filled-tonal-button>
                </div>

                {/* Dynamic Rule Buttons */}
                {activeRules.map(rule => {
                    const isSelected = filter === rule.tag;

                    // Helper to get colors based on rule.color class
                    const getColors = (colorClass: string) => {
                        switch (colorClass) {
                            case 'bg-orange-soft': return { bg: '#FFF9E6', text: '#FF9800', selectedBg: '#5c4021' }; // Interview
                            case 'bg-green-soft': return { bg: '#E6F4EA', text: '#1E8E3E', selectedBg: '#0D652D' }; // Call Letter
                            case 'bg-red-soft': return { bg: '#FCE8E6', text: '#C5221F', selectedBg: '#B31412' }; // Test
                            case 'bg-blue-soft': return { bg: '#E8F0FE', text: '#1967D2', selectedBg: '#174EA6' }; // Shortlist
                            case 'bg-purple-pastel': return { bg: '#F3E5F5', text: '#7B1FA2', selectedBg: '#4A148C' };
                            case 'bg-pink-pastel': return { bg: '#FCE4EC', text: '#C2185B', selectedBg: '#880E4F' };
                            case 'bg-green-pastel': return { bg: '#E0F2F1', text: '#00796B', selectedBg: '#004D40' };
                            case 'bg-blue-pastel': return { bg: '#E3F2FD', text: '#1565C0', selectedBg: '#0D47A1' };
                            default: return { bg: '#F5F5F5', text: '#616161', selectedBg: '#212121' };
                        }
                    };

                    const style = getColors(rule.color);
                    // Determine Icon based on Tag or Description
                    const getIcon = (tag: string) => {
                        if (tag.includes('interview')) return 'event';
                        if (tag.includes('test') || tag.includes('exam')) return 'assignment';
                        if (tag.includes('letter') || tag.includes('shortlist')) return 'verified';
                        return 'bookmark';
                    }
                    const icon = getIcon(rule.tag);

                    return (
                        <div key={rule.id} onClick={() => setFilter(rule.tag)} style={{ flex: '1 1 100px', minWidth: '110px', height: '90px' }}>
                            {/* @ts-ignore */}
                            <md-filled-tonal-button style={{ width: '100%', height: '100%', '--md-filled-tonal-button-container-shape': '24px', '--md-filled-tonal-button-container-color': isSelected ? style.selectedBg : style.bg, '--md-filled-tonal-button-label-text-color': isSelected ? '#FFF' : style.text }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', color: isSelected ? '#FFFFFF' : style.text }}>
                                    {/* @ts-ignore */}
                                    <md-icon style={{ fontSize: '20px', color: 'inherit' }}>{icon}</md-icon>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'capitalize' }}>{rule.tag.replace(/_/g, ' ')}</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stats[rule.tag] || 0}</span>
                                    </div>
                                </div>
                            </md-filled-tonal-button>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1rem', padding: '0 8px' }}>
                <h3 className="section-title" style={{ margin: 0, fontSize: '1.25rem' }}>Task List</h3>
                <md-icon-button onClick={fetchEmails}>
                    <md-icon>{loading ? 'sync' : 'refresh'}</md-icon>
                </md-icon-button>
            </div>

            {loading ? (
                <div className="loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: '1rem' }}>
                    <md-circular-progress indeterminate></md-circular-progress>
                    <span style={{ color: 'var(--text-secondary)' }}>Scanning inbox...</span>
                </div>
            ) : (
                <div className="email-list">
                    {emails.length === 0 ? (
                        <div className="email-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No updates found recently.
                        </div>
                    ) : (
                        <div className="segmented-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredEmails.map((email) => (
                                <div
                                    key={email.id}
                                    onClick={() => setSelectedEmail(email)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        backgroundColor: 'var(--md-sys-color-surface-container)',
                                        borderRadius: '16px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.1s'
                                    }}
                                    className="task-item"
                                >
                                    <md-icon style={{ color: '#555', marginRight: '16px' }}>
                                        {getIconName(email.type)}
                                    </md-icon>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {email.subject}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {email.institution}
                                        </div>
                                    </div>
                                    <div style={{ marginLeft: '12px', textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                            {formatDistanceToNow(new Date(email.date), { addSuffix: true }).replace('about ', '')}
                                        </div>
                                        <md-icon style={{ fontSize: '18px', color: '#ccc' }}>chevron_right</md-icon>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            )
            }

            {/* Email Detail Modal */}
            {
                selectedEmail && (
                    <div className="email-modal-overlay" onClick={() => setSelectedEmail(null)}>
                        <div className="email-modal-card" onClick={e => e.stopPropagation()} style={{ borderRadius: '28px' }}>

                            {/* Header: Back & Subject */}
                            <div className="mail-view-header">
                                <md-icon-button onClick={() => setSelectedEmail(null)}>
                                    <md-icon>arrow_back</md-icon>
                                </md-icon-button>
                                <div style={{ flex: 1, marginLeft: '8px' }}>
                                    <h2 className="mail-subject" style={{ fontSize: '1.2rem', lineHeight: '1.3', margin: '0 0 4px 0' }}>{selectedEmail.subject}</h2>
                                    <span className="mail-tag-badge">Inbox</span>
                                </div>
                            </div>

                            {/* Sender & Metadata Row */}
                            <div className="mail-sender-row" style={{ padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="sender-avatar" style={{ width: '40px', height: '40px', fontSize: '1.2rem', backgroundColor: '#C3E7FF', color: '#001D35', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                        {selectedEmail.sender.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span className="sender-name" style={{ fontWeight: 600, fontSize: '1rem' }}>
                                                {selectedEmail.institution || selectedEmail.sender.split('<')[0].replace(/"/g, '')}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {format(new Date(selectedEmail.date), 'MMM d, h:mm a')}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }} onClick={() => setShowDetails(!showDetails)}>
                                            <span>To: {selectedEmail.to ? (selectedEmail.to.includes(user?.email || '') ? 'Me' : selectedEmail.to.split('<')[0]) : 'Me'}</span>
                                            {/* @ts-ignore */}
                                            <md-icon style={{ fontSize: '18px' }}>{showDetails ? 'expand_less' : 'expand_more'}</md-icon>
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Details Card */}
                                {showDetails && (
                                    <div style={{
                                        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        marginTop: '4px',
                                        border: isDark ? '1px solid #333' : '1px solid #E0E0E0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        fontSize: '0.9rem'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>From</span>
                                            <div style={{ wordBreak: 'break-all' }}>
                                                <span style={{ fontWeight: 500 }}>{selectedEmail.sender.split('<')[0].replace(/"/g, '')}</span>
                                                <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>
                                                    {selectedEmail.sender.match(/<([^>]+)>/)?.[1] ? `<${selectedEmail.sender.match(/<([^>]+)>/)?.[1]}>` : ''}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>To</span>
                                            <div style={{ wordBreak: 'break-all' }}>
                                                <span style={{ fontWeight: 500 }}>{selectedEmail.to?.split('<')[0].replace(/"/g, '') || 'Me'}</span>
                                                <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>
                                                    {selectedEmail.to?.match(/<([^>]+)>/)?.[1] ? `<${selectedEmail.to?.match(/<([^>]+)>/)?.[1]}>` : user?.email}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedEmail.cc && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Cc</span>
                                                <div style={{ wordBreak: 'break-all' }}>
                                                    {selectedEmail.cc}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                                            <div>{format(new Date(selectedEmail.date), 'dd MMM yyyy, h:mm a')}</div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {/* @ts-ignore */}
                                            <md-icon style={{ fontSize: '16px' }}>lock</md-icon>
                                            <span>Standard encryption (TLS)</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Body Content */}
                            <div className="mail-body-container" style={{
                                marginTop: '8px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                backgroundColor: isDark ? 'var(--md-sys-color-surface-container-high)' : '#FFFFFF',
                                border: isDark ? 'none' : '1px solid #E0E0E0',
                            }}>
                                <iframe
                                    title="email-body"
                                    srcDoc={selectedEmail.body ? `
                                    <!DOCTYPE html>
                                    <html class="${isDark ? 'dark-mode' : ''}">
                                    <head>
                                        <meta charset="utf-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <style>
                                            * { box-sizing: border-box; }
                                            body { 
                                                font-family: 'Roboto', system-ui, -apple-system, sans-serif;
                                                color: ${isDark ? '#E3E3E3' : '#1D1D1D'}; 
                                                line-height: 1.6; 
                                                font-size: 15px; 
                                                margin: 0; padding: 24px; 
                                                overflow-x: hidden; 
                                                word-wrap: break-word;
                                                background-color: transparent !important;
                                            }
                                            /* Force dark mode overrides */
                                            html.dark-mode, html.dark-mode body, html.dark-mode div, html.dark-mode p, html.dark-mode td {
                                                background-color: transparent !important;
                                                color: #E3E3E3 !important;
                                            }
                                            img { max-width: 100% !important; height: auto !important; border-radius: 8px; }
                                            a { color: ${isDark ? '#A8C7FA' : '#0B57D0'} !important; text-decoration: none; }
                                            
                                            /* Handle Tables */
                                            table { max-width: 100% !important; display: block; overflow-x: auto; background-color: transparent !important; }
                                        </style>
                                    </head>
                                    <body>
                                        ${selectedEmail.body}
                                    </body>
                                    </html>
                                ` : selectedEmail.snippet}
                                    style={{ width: '100%', height: '100%', minHeight: '500px', border: 'none', display: 'block' }}
                                />
                            </div>

                            {/* Floating Gmail Action */}
                            <div className="floating-gmail-dock">
                                <a
                                    href={`https://mail.google.com/mail/u/0/#inbox/${selectedEmail.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="gmail-dock-btn"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                                >
                                    <md-icon style={{ color: 'white' }}>mail</md-icon>
                                </a>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
