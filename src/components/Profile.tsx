import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey } from '../services/gemini';

import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import './profile.css';

const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [apiKeyValue, setApiKeyValue] = useState('');
    const [savedStatus, setSavedStatus] = useState<'idle' | 'saved' | 'removed'>('idle');

    useEffect(() => {
        const existing = getGeminiApiKey();
        if (existing) setApiKeyValue(existing);
    }, []);

    const handleForceLogout = () => {
        // Clear everything to fix 401 loops
        localStorage.clear();
        sessionStorage.clear();
        console.log('Force clearing storage');
        logout();
        window.location.href = '/'; // Hard reload
    };

    const handleSaveApiKey = () => {
        if (apiKeyValue.trim()) {
            setGeminiApiKey(apiKeyValue.trim());
            setSavedStatus('saved');
            setTimeout(() => setSavedStatus('idle'), 2000);
        }
    };

    const handleRemoveApiKey = () => {
        removeGeminiApiKey();
        setApiKeyValue('');
        setSavedStatus('removed');
        setTimeout(() => setSavedStatus('idle'), 2000);
    };

    const maskApiKey = (key: string) => {
        if (!key || key.length < 8) return '••••••••';
        return key.slice(0, 4) + '••••' + key.slice(-4);
    };

    if (!user) return null;

    const currentKey = getGeminiApiKey();

    return (
        <div className="profile-page" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>


            {/* Avatar & Info */}
            <div
                className="profile-avatar-large"
                style={{
                    backgroundImage: `url(${user.picture || 'https://i.pravatar.cc/300?img=32'})`,
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            />
            <div className="profile-name-large" style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '4px' }}>{user.name}</div>
            <div className="profile-email-large" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>{user.email}</div>


            {/* Menu List */}
            <div className="segmented-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '600px' }}>
                {[
                    { icon: 'account_circle', label: 'Username', sub: `@${user.email.split('@')[0]}` },
                    { icon: 'notifications', label: 'Notifications', sub: 'Mute, Push, Email' },
                    { icon: 'settings', label: 'Settings', sub: 'Security, Privacy' }
                ].map((item, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            backgroundColor: 'var(--md-sys-color-surface-container)',
                            borderRadius: '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 0.1s'
                        }}
                    >
                        <md-icon style={{ color: '#555', marginRight: '16px', fontSize: '24px' }}>{item.icon}</md-icon>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '1rem', marginBottom: '4px', color: 'var(--md-sys-color-on-surface)' }}>{item.label}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.sub}</div>
                        </div>
                        <md-icon style={{ color: '#ccc' }}>chevron_right</md-icon>
                    </div>
                ))}

                {/* Gemini API Key Row */}
                <div
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        border: '1px solid rgba(123, 31, 162, 0.15)'
                    }}
                >
                    <md-icon style={{ color: '#7B1FA2', marginRight: '16px', fontSize: '24px' }}>key</md-icon>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '1rem', marginBottom: '4px', color: 'var(--md-sys-color-on-surface)' }}>Gemini API Key</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: currentKey ? "'Roboto Mono', monospace" : 'inherit' }}>
                            {currentKey ? maskApiKey(currentKey) : 'Not set — tap to add'}
                        </div>
                    </div>
                    <md-icon style={{ color: '#7B1FA2' }}>{showApiKeyInput ? 'expand_less' : 'expand_more'}</md-icon>
                </div>

                {/* Expandable API Key Input */}
                {showApiKeyInput && (
                    <div className="api-key-section">
                        <div className="api-key-input-row">
                            <input
                                type="text"
                                className="api-key-input"
                                placeholder="Enter your Gemini API key"
                                value={apiKeyValue}
                                onChange={(e) => setApiKeyValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveApiKey(); }}
                            />
                            <button className="api-key-save-btn" onClick={handleSaveApiKey}>
                                Save
                            </button>
                        </div>
                        {currentKey && (
                            <button
                                onClick={handleRemoveApiKey}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#F44336',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    padding: '4px 0',
                                    fontFamily: 'inherit',
                                    fontWeight: 500
                                }}
                            >
                                Remove API Key
                            </button>
                        )}
                        {savedStatus === 'saved' && (
                            <div className="api-key-status">
                                <md-icon style={{ fontSize: '14px', color: '#4CAF50' }}>check_circle</md-icon>
                                API key saved successfully
                            </div>
                        )}
                        {savedStatus === 'removed' && (
                            <div className="api-key-status" style={{ color: '#F44336' }}>
                                <md-icon style={{ fontSize: '14px', color: '#F44336' }}>delete</md-icon>
                                API key removed
                            </div>
                        )}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                            Get your free API key from{' '}
                            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: '#7B1FA2' }}>
                                Google AI Studio
                            </a>
                        </p>
                    </div>
                )}
            </div>

            {/* Fix Button */}
            <div style={{ marginTop: 'auto', paddingBottom: '80px', width: '100%', maxWidth: '300px' }}>
                <md-filled-button onClick={handleForceLogout} style={{ width: '100%' }}>
                    <md-icon slot="icon">logout</md-icon>
                    Sign Out
                </md-filled-button>
                <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '12px', textAlign: 'center' }}>
                    Tap above if facing sync errors
                </p>
            </div>

        </div>
    );
};

export default Profile;

