import React from 'react';
import { useAuth } from '../contexts/AuthContext';

import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import './profile.css';

const Profile: React.FC = () => {
    const { user, logout } = useAuth();

    const handleForceLogout = () => {
        // Clear everything to fix 401 loops
        localStorage.clear();
        sessionStorage.clear();
        console.log('Force clearing storage');
        logout();
        window.location.href = '/'; // Hard reload
    };

    if (!user) return null;

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
