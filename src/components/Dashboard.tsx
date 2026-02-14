import React, { useEffect, useState } from 'react';
import { listMessages, getMessage } from '../services/gmail';
import { parseEmail, type ParsedEmail } from '../services/parser';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, Building2, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SummaryCards from './SummaryCards';

const Dashboard: React.FC = () => {
    const { isGapiReady, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [emails, setEmails] = useState<ParsedEmail[]>([]);

    // Stats state
    const [stats, setStats] = useState({
        total: 0,
        interviews: 0,
        tests: 0,
        shortlists: 0
    });

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

            if (savedRulesStr) {
                const rules: any[] = JSON.parse(savedRulesStr);
                const excludeRules = rules.filter(r => r.criteria?.excludeFrom && r.isActive);

                if (excludeRules.length > 0) {
                    filtered = sorted.filter((email: ParsedEmail) => {
                        // Check if email matches any exclude rule
                        const shouldExclude = excludeRules.some((rule: any) => {
                            const excludePattern = rule.criteria.excludeFrom.toLowerCase();
                            return email.sender.toLowerCase().includes(excludePattern);
                        });
                        return !shouldExclude;
                    });
                }
            }

            setEmails(filtered);

            // Calculate stats
            const newStats = {
                total: sorted.length,
                interviews: sorted.filter((e: ParsedEmail) => e.type === 'interview').length,
                tests: sorted.filter((e: ParsedEmail) => e.type === 'test').length,
                shortlists: sorted.filter((e: ParsedEmail) => e.type === 'call_letter' || e.type === 'shortlist').length
            };
            setStats(newStats);

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

    const getStatusStyle = (type: string) => {
        switch (type) {
            case 'interview': return 'bg-orange-soft';
            case 'call_letter': return 'bg-green-soft';
            case 'test': return 'bg-red-soft';
            default: return 'bg-blue-soft';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'interview': return <Calendar size={24} />;
            case 'call_letter': return <CheckCircle2 size={24} />;
            case 'test': return <AlertCircle size={24} />;
            default: return <Building2 size={24} />;
        }
    };

    return (
        <div className="dashboard-content">
            <SummaryCards {...stats} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
                <h3 className="section-title" style={{ margin: 0 }}>Task List</h3>
                <button
                    onClick={fetchEmails}
                    style={{
                        padding: '8px', background: '#F2F2F7', color: '#1D1D1D',
                        border: 'none', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s', width: 36, height: 36
                    }}
                    title="Refresh"
                >
                    <RefreshCw size={18} className={loading ? 'spin-anim' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="loading" style={{ color: 'var(--text-secondary)' }}>
                    Scanning your inbox...
                    <div className="spinner" />
                </div>
            ) : (
                <div className="email-list">
                    {emails.length === 0 ? (
                        <div className="email-card" style={{ justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            No updates found recently.
                        </div>
                    ) : (
                        emails.map((email) => (
                            <div
                                key={email.id}
                                className="email-card"
                                onClick={() => setSelectedEmail(email)}
                                style={{
                                    borderRadius: '20px', padding: '16px', marginBottom: '12px',
                                    boxShadow: 'var(--shadow-card)', border: 'none',
                                    position: 'relative'
                                }}
                            >
                                <div className={`card-icon-box ${getStatusStyle(email.type)}`} style={{
                                    borderRadius: '50%', width: 44, height: 44
                                }}>
                                    {getIcon(email.type)}
                                </div>

                                <div className="card-info">
                                    <h4 className="email-subject-line" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '2px' }}>
                                        {email.subject}
                                    </h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {email.institution} • {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                                    </div>
                                </div>

                                <button className="action-circle-btn">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Email Detail Modal - Reference UI */}
            {selectedEmail && (
                <div className="email-modal-overlay" onClick={() => setSelectedEmail(null)}>
                    <div className="email-modal-card" onClick={e => e.stopPropagation()}>

                        {/* Header: Back & Subject */}
                        <div className="mail-view-header">
                            <button onClick={() => setSelectedEmail(null)} className="mail-back-btn">
                                <ChevronLeft size={28} />
                            </button>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span className="mail-tag-badge">Inbox</span>
                                    <span style={{ fontSize: '0.8rem', color: '#8E8E93' }}>
                                        {format(new Date(selectedEmail.date), 'MMM d')}
                                    </span>
                                </div>
                                <h2 className="mail-subject">{selectedEmail.subject}</h2>
                            </div>
                        </div>

                        {/* Sender Row */}
                        <div className="mail-sender-row">
                            <div className="sender-avatar">
                                {selectedEmail.sender.charAt(0).toUpperCase()}
                            </div>
                            <div className="sender-meta">
                                <div className="sender-name-row">
                                    <span className="sender-name">{selectedEmail.sender}</span>
                                    <span className="sender-email text-secondary">
                                        &lt;{selectedEmail.institution}&gt;
                                    </span>
                                </div>
                                <div className="mail-date">
                                    To: <span style={{ color: '#1D1D1D' }}>Me</span>, &nbsp;
                                    {format(new Date(selectedEmail.date), 'MMM d, yyyy • h:mm a')}
                                </div>
                            </div>
                        </div>

                        {/* Body Content */}
                        <div className="mail-body-container">
                            <iframe
                                title="email-body"
                                srcDoc={selectedEmail.body ? `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta charset="utf-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <style>
                                            * {
                                                box-sizing: border-box;
                                            }
                                            body { 
                                                font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                                                color: #1D1D1D; 
                                                line-height: 1.6; 
                                                font-size: 15px; 
                                                margin: 0; 
                                                padding: 12px; 
                                                overflow-x: hidden; 
                                                width: 100% !important;
                                                word-wrap: break-word;
                                            }
                                            /* Force containment */
                                            table, div, p { 
                                                max-width: 100% !important; 
                                                width: auto !important; 
                                            }
                                            img { 
                                                max-width: 100% !important; 
                                                height: auto !important; 
                                                display: block;
                                            }
                                            a { color: #007AFF; text-decoration: none; }
                                            
                                            /* Dark Mode Styles */
                                            body.dark-mode {
                                                background-color: #1E1E1E !important;
                                                color: #E0E0E0 !important;
                                            }
                                            body.dark-mode a { color: #64B5F6 !important; }
                                            body.dark-mode tr, body.dark-mode td {
                                                background-color: transparent !important;
                                                color: #E0E0E0 !important;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        ${selectedEmail.body}
                                    </body>
                                    </html>
                                ` : selectedEmail.snippet}
                                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                            />
                        </div>

                        {/* Attachments Section Removed */}

                        {/* Floating Gmail Action */}
                        <div className="floating-gmail-dock">
                            <a
                                href={`https://mail.google.com/mail/u/0/#inbox/${selectedEmail.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="gmail-dock-btn"
                            >
                                <Mail size={24} color="white" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
