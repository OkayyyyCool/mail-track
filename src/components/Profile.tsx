import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Bell, Settings, AlertTriangle, ChevronRight } from 'lucide-react';
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
        <div className="profile-page">


            {/* Avatar & Info */}
            <div
                className="profile-avatar-large"
                style={{ backgroundImage: `url(${user.picture || 'https://i.pravatar.cc/300?img=32'})` }}
            />
            <div className="profile-name-large">{user.name}</div>
            <div className="profile-email-large">{user.email}</div>



            {/* Menu List */}
            <div className="profile-menu-container">
                <div className="profile-menu-item">
                    <div className="menu-icon-circle" style={{ background: '#F3E5F5' }}>
                        <User size={20} color="#9C27B0" />
                    </div>
                    <div className="menu-text-content">
                        <div className="menu-title">Username</div>
                        <div className="menu-subtitle">@{user.email.split('@')[0]}</div>
                    </div>
                    <ChevronRight size={20} color="#C7C7CC" />
                </div>

                <div className="profile-menu-item">
                    <div className="menu-icon-circle" style={{ background: '#E0F7FA' }}>
                        <Bell size={20} color="#00BCD4" />
                    </div>
                    <div className="menu-text-content">
                        <div className="menu-title">Notifications</div>
                        <div className="menu-subtitle">Mute, Push, Email</div>
                    </div>
                    <ChevronRight size={20} color="#C7C7CC" />
                </div>

                <div className="profile-menu-item">
                    <div className="menu-icon-circle" style={{ background: '#E8F5E9' }}>
                        <Settings size={20} color="#4CAF50" />
                    </div>
                    <div className="menu-text-content">
                        <div className="menu-title">Settings</div>
                        <div className="menu-subtitle">Security, Privacy</div>
                    </div>
                    <ChevronRight size={20} color="#C7C7CC" />
                </div>
            </div>

            {/* Fix Button */}
            <button className="force-logout-btn" onClick={handleForceLogout}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <AlertTriangle size={18} />
                    <span>Fix Connection / Sign Out</span>
                </div>
            </button>
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '8px' }}>Tap above if facing sync errors</p>

        </div>
    );
};

export default Profile;
