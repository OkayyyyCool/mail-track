import React from 'react';
import { Mail, Calendar, FileCheck, CheckCircle2 } from 'lucide-react';

interface StatsProps {
    total: number;
    interviews: number;
    tests: number;
    shortlists: number;
}

const SummaryCards: React.FC<StatsProps> = ({ total, interviews, tests, shortlists }) => {
    return (
        <div>
            <div className="summary-row">
                {/* Total - Blue */}
                <div className="summary-card" style={{ background: 'var(--accent-blue-bg)' }}>
                    <div className="summary-icon-wrapper">
                        <Mail size={20} color="white" />
                    </div>
                    <div className="summary-label" style={{ color: 'var(--accent-blue-text)', marginTop: 'auto' }}>Total</div>
                    <div className="summary-value" style={{ color: 'var(--text-primary)' }}>{total}</div>
                </div>

                {/* Interviews - Yellow */}
                <div className="summary-card" style={{ background: 'var(--accent-yellow-bg)' }}>
                    <div className="summary-icon-wrapper">
                        <Calendar size={20} color="white" />
                    </div>
                    <div className="summary-label" style={{ color: 'var(--accent-yellow-text)', marginTop: 'auto' }}>Interviews</div>
                    <div className="summary-value" style={{ color: 'var(--text-primary)' }}>{interviews}</div>
                </div>

                {/* Tests - Purple */}
                <div className="summary-card" style={{ background: 'var(--accent-purple-bg)' }}>
                    <div className="summary-icon-wrapper">
                        <FileCheck size={20} color="white" />
                    </div>
                    <div className="summary-label" style={{ color: 'var(--accent-purple-text)', marginTop: 'auto' }}>Tests</div>
                    <div className="summary-value" style={{ color: 'var(--text-primary)' }}>{tests}</div>
                </div>

                {/* Shortlists - Green */}
                <div className="summary-card" style={{ background: 'var(--accent-green-bg)' }}>
                    <div className="summary-icon-wrapper">
                        <CheckCircle2 size={20} color="white" />
                    </div>
                    <div className="summary-label" style={{ color: 'var(--accent-green-text)', marginTop: 'auto' }}>Shortlists</div>
                    <div className="summary-value" style={{ color: 'var(--text-primary)' }}>{shortlists}</div>
                </div>
            </div>

            <style>{`
                .summary-card {
                    min-width: 120px;
                    height: 140px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: flex-start;
                    border-radius: 28px;
                    box-shadow: none;
                }
                .summary-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    background: #1D1D1D !important; /* Force Black */
                }
                .summary-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                .summary-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
            `}</style>
        </div>
    );
};

export default SummaryCards;
