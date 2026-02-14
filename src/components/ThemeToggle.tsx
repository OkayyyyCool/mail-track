import React from 'react';
import '@material/web/switch/switch.js';
import '@material/web/icon/icon.js';
import '../styles.css';

interface ThemeToggleProps {
    isDark: boolean;
    toggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
    return (
        <div className="theme-toggle-wrapper">
            {/* @ts-ignore */}
            <md-switch
                selected={isDark}
                onClick={toggle}
                icons
                show-only-selected-icon
            >
                {/* @ts-ignore */}
                <md-icon slot="on-icon">dark_mode</md-icon>
                {/* @ts-ignore */}
                <md-icon slot="off-icon">light_mode</md-icon>
            </md-switch>
        </div>
    );
};

export default ThemeToggle;
