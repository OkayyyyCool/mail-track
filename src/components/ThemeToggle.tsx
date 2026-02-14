import React from 'react';
import { Sun, Moon } from 'lucide-react';
import '../styles.css';

interface ThemeToggleProps {
    isDark: boolean;
    toggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
    return (
        <div className="theme-toggle-wrapper" onClick={toggle}>
            <div className={`theme-toggle-switch ${isDark ? 'dark' : 'light'}`}>
                <div className="toggle-icon sun">
                    <Sun size={14} color={isDark ? '#8E8E93' : '#FDB813'} />
                </div>
                <div className="toggle-icon moon">
                    <Moon size={14} color={isDark ? '#FFFFFF' : '#8E8E93'} />
                </div>
                <div className="toggle-circle" />
            </div>
        </div>
    );
};

export default ThemeToggle;
