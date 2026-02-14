import React, { useState } from 'react';
import Login from './components/Login';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Rules from './components/Rules';
import Profile from './components/Profile';
import { Home, UserCircle, Bell, ListChecks } from 'lucide-react';
import './styles.css';

function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  React.useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Glass Header */}
      <header className="glass-header">
        <div>
          {/* Removed "Welcome back" label as requested */}
          <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1.2 }}>{user.name}</div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

          <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bell size={24} color={isDark ? '#FFF' : 'var(--primary-blue)'} />
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 10, height: 10, background: 'red',
              borderRadius: '50%', border: '2px solid white'
            }} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'home' && <Dashboard isDark={isDark} />}
        {activeTab === 'rules' && <Rules />}
        {activeTab === 'profile' && <Profile />}
      </main>

      {/* Glass Bottom Dock */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span>Home</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <ListChecks size={24} strokeWidth={activeTab === 'rules' ? 2.5 : 2} />
          <span>Rules</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserCircle size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
