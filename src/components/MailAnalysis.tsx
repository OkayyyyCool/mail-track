import React, { useState, useRef } from 'react';
import { analyzeEmail, getGeminiApiKey, type MailAnalysisResult } from '../services/gemini';
import { type ParsedEmail } from '../services/parser';
import '@material/web/icon/icon.js';
import '@material/web/progress/circular-progress.js';

interface MailAnalysisProps {
    email: ParsedEmail;
    isDark: boolean;
}

const MailAnalysis: React.FC<MailAnalysisProps> = ({ email, isDark }) => {
    const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [result, setResult] = useState<MailAnalysisResult | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [dismissed, setDismissed] = useState(false);
    const cacheRef = useRef<Record<string, MailAnalysisResult>>({});

    const handleAnalyze = async () => {
        // Check API key first
        if (!getGeminiApiKey()) {
            setState('error');
            setErrorMsg('No API key set. Go to your Profile to add your Gemini API key.');
            return;
        }

        // Check cache
        if (cacheRef.current[email.id]) {
            setResult(cacheRef.current[email.id]);
            setState('done');
            return;
        }

        setState('loading');
        setErrorMsg('');

        try {
            const analysis = await analyzeEmail(
                email.subject,
                email.sender,
                email.body || email.snippet
            );
            cacheRef.current[email.id] = analysis;
            setResult(analysis);
            setState('done');
        } catch (err: any) {
            setState('error');
            if (err.message === 'NO_API_KEY') {
                setErrorMsg('No API key set. Go to your Profile to add your Gemini API key.');
            } else if (err.message === 'INVALID_API_KEY') {
                setErrorMsg('Invalid API key. Please check your Gemini API key in Profile settings.');
            } else {
                setErrorMsg(err.message || 'Analysis failed. Please try again.');
            }
        }
    };

    if (dismissed) return null;

    // Idle — show the trigger button
    if (state === 'idle') {
        return (
            <div className="ai-analysis-section">
                <button className="ai-analysis-trigger" onClick={handleAnalyze}>
                    <md-icon style={{ fontSize: '18px', color: 'inherit' }}>auto_awesome</md-icon>
                    <span>Analyze with AI</span>
                </button>
            </div>
        );
    }

    // Loading
    if (state === 'loading') {
        return (
            <div className="ai-analysis-section">
                <div className={`ai-analysis-card ${isDark ? 'dark' : ''}`}>
                    <div className="ai-loading">
                        <md-circular-progress indeterminate style={{ '--md-circular-progress-size': '28px' } as React.CSSProperties}></md-circular-progress>
                        <span>Analyzing mail with Gemini...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Error
    if (state === 'error') {
        return (
            <div className="ai-analysis-section">
                <div className={`ai-analysis-card ${isDark ? 'dark' : ''}`}>
                    <div className="ai-error">
                        <md-icon style={{ fontSize: '20px', color: '#F44336' }}>error_outline</md-icon>
                        <span>{errorMsg}</span>
                    </div>
                    <button className="ai-retry-btn" onClick={() => { setState('idle'); setErrorMsg(''); }}>
                        <md-icon style={{ fontSize: '16px' }}>refresh</md-icon>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Done — show results
    if (!result) return null;

    return (
        <div className="ai-analysis-section">
            <div className={`ai-analysis-card ${isDark ? 'dark' : ''}`}>
                {/* Header */}
                <div className="ai-card-header">
                    <div className="ai-card-title">
                        <md-icon style={{ fontSize: '18px', color: '#7B1FA2' }}>auto_awesome</md-icon>
                        <span>AI Analysis</span>
                    </div>
                    <button className="ai-dismiss-btn" onClick={() => setDismissed(true)}>
                        <md-icon style={{ fontSize: '18px' }}>close</md-icon>
                    </button>
                </div>

                {/* College Name & Event Type */}
                {(result.collegeName || result.eventType) && (
                    <div className="ai-pills-row">
                        {result.collegeName && (
                            <div className="ai-chip college">
                                <md-icon style={{ fontSize: '14px' }}>school</md-icon>
                                {result.collegeName}
                            </div>
                        )}
                        {result.eventType && (
                            <div className="ai-chip event">
                                <md-icon style={{ fontSize: '14px' }}>event</md-icon>
                                {result.eventType}
                            </div>
                        )}
                    </div>
                )}

                {/* Event Date */}
                {result.eventDate && (
                    <div className="ai-info-row">
                        <md-icon style={{ fontSize: '16px', color: '#E65100' }}>calendar_today</md-icon>
                        <span className="ai-date-text">{result.eventDate}</span>
                    </div>
                )}

                {/* Summary */}
                <div className="ai-summary" style={{
                    lineHeight: '1.6',
                    fontSize: '0.9rem',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                }}>
                    <p style={{ margin: 0 }}>{result.summary}</p>
                </div>

                {/* Important Links */}
                {result.importantLinks.length > 0 && (
                    <div className="ai-links-section">
                        <div className="ai-section-label">
                            <md-icon style={{ fontSize: '14px' }}>link</md-icon>
                            Important Links
                        </div>
                        <div className="ai-links-row">
                            {result.importantLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ai-link-chip"
                                >
                                    {link.label}
                                    <md-icon style={{ fontSize: '12px' }}>open_in_new</md-icon>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Info */}
                {result.otherInfo.length > 0 && result.otherInfo.some(info => info && info.trim()) && (
                    <div className="ai-other-section">
                        <div className="ai-section-label">
                            <md-icon style={{ fontSize: '14px' }}>lightbulb</md-icon>
                            Key Details
                        </div>
                        <ul className="ai-other-list" style={{
                            margin: '4px 0 0',
                            paddingLeft: '20px',
                            lineHeight: '1.6',
                            fontSize: '0.85rem'
                        }}>
                            {result.otherInfo.filter(info => info && info.trim()).map((info, i) => (
                                <li key={i} style={{ marginBottom: '4px' }}>{info}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MailAnalysis;
