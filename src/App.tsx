import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Rules from './components/Rules';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import '@material/web/divider/divider.js';
// styles.css imported in main.tsx

// Material Web Components
import '@material/web/icon/icon.js';
import '@material/web/fab/fab.js';
import '@material/web/textfield/outlined-text-field.js';

function App() {
  const { user, logout } = useAuth();
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Restore active tab if possible, default to home
    return localStorage.getItem('activeTab') || 'home';
  });

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Search History State
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    setShowSearchDropdown(false);
    if (term.trim()) {
      const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  if (!user) {
    return <Login />;
  }






  return (
    <div className="app-container">
      {/* PWA Install Banner */}
      {isInstallable && showInstallBanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #4285F4, #7B1FA2)',
          color: '#fff',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.9rem',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          <span>📱 Install MailTrack for a better experience</span>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={promptInstall}
              style={{
                background: '#fff',
                color: '#4285F4',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 16px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >Install</button>
            <button
              onClick={() => setShowInstallBanner(false)}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >✕</button>
          </div>
        </div>
      )}
      {/* Material Header */}
      <header className="glass-header" style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--header-border)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ flex: 1, marginRight: '16px', position: 'relative' }}>
          {/* Show Search Pill for Home AND Rules */}
          {(activeTab === 'home' || activeTab === 'rules') ? (
            <div className="search-pill-container" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              {/* @ts-ignore */}
              <md-outlined-text-field
                placeholder={activeTab === 'rules' ? "Search rules" : "Search messages"}
                value={searchQuery}
                onInput={(e: any) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)} // Delay to allow clicks
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(searchQuery);
                  }
                }}
                style={{ width: '100%', borderRadius: '28px', '--md-outlined-text-field-container-shape': '28px' }}
              >
                {/* @ts-ignore */}
                <md-icon slot="leading-icon">search</md-icon>
              </md-outlined-text-field>

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div className="search-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderRadius: '0 0 16px 16px',
                  marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: isDark ? '1px solid #333' : '1px solid #E0E0E0',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  {/* History Section */}
                  {searchHistory.length > 0 && searchQuery === '' && (
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ padding: '0 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Recent</span>
                        {/* @ts-ignore */}
                        <span style={{ cursor: 'pointer', fontSize: '0.7rem' }} onClick={clearHistory}>Clear All</span>
                      </div>
                      {searchHistory.map((item, index) => (
                        <div key={index}
                          onClick={() => handleSearchSubmit(item)}
                          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                          className="search-item"
                        >
                          {/* @ts-ignore */}
                          <md-icon style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>history</md-icon>
                          <span style={{ flex: 1, fontSize: '0.9rem' }}>{item}</span>
                          {/* @ts-ignore */}
                          <md-icon style={{ fontSize: '16px', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={(e) => removeHistoryItem(e, item)}>close</md-icon>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations (Mocked for now - requires lifting state) */}
                  {searchQuery !== '' && (
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ padding: '8px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Press Enter to search for "{searchQuery}"
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '1.5rem', fontWeight: '500', lineHeight: 1.2 }}>
              {activeTab === 'rules' ? 'Rules' : ''}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

          <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} />

          {/* Profile Avatar Trigger */}
          <div onClick={() => setShowProfile(!showProfile)} style={{ cursor: 'pointer', position: 'relative' }}>
            {/* @ts-ignore */}
            {user.picture ? (
              /* @ts-ignore */
              <img src={user.picture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6750A4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Profile Popup */}
          {showProfile && (
            <div className="profile-popup" style={{
              position: 'absolute',
              top: '60px',
              right: '24px',
              background: 'var(--md-sys-color-surface-container)',
              padding: '24px',
              borderRadius: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              minWidth: '280px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {/* @ts-ignore */}
                {user.picture ? (
                  /* @ts-ignore */
                  <img src={user.picture} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#6750A4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    {user.name?.charAt(0)}
                  </div>
                )}

                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.name}</h3>
                  <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>{user.email}</span>
                </div>
              </div>

              {/* Centered Logout Button */}
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {/* @ts-ignore */}
                <md-fab variant="secondary" size="medium" onClick={logout}>
                  {/* @ts-ignore */}
                  <md-icon slot="icon">logout</md-icon>
                  Sign Out
                </md-fab>
              </div>
            </div>
          )}

        </div>
      </header>
      {showProfile && <div className="backdrop" onClick={() => setShowProfile(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }}></div>}


      {/* Main Content Area */}
      <main className="main-content" style={{ paddingBottom: '80px' }}>
        {activeTab === 'home' && <Dashboard searchQuery={searchQuery} isDark={isDark} />}
        {activeTab === 'rules' && <Rules searchQuery={searchQuery} />}
      </main>

      {/* Inline FABs Navigation */}
      <div className="bottom-nav-container" style={{ position: 'fixed', bottom: '24px', left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none', gap: '24px' }}>
        <div style={{ pointerEvents: 'auto' }}>
          {/* @ts-ignore */}
          <md-fab variant={activeTab === 'home' ? 'primary' : 'surface'} onClick={() => setActiveTab('home')}>
            {/* @ts-ignore */}
            <md-icon slot="icon">home</md-icon>
          </md-fab>
        </div>

        <div style={{ pointerEvents: 'auto' }}>
          {/* @ts-ignore */}
          <md-fab variant={activeTab === 'rules' ? 'primary' : 'surface'} onClick={() => setActiveTab('rules')}>
            {/* @ts-ignore */}
            <md-icon slot="icon">checklist</md-icon>
          </md-fab>
        </div>
      </div>
    </div>
  );
}

export default App;
