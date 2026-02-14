import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const { login, isLoading } = useAuth();

    return (
        <div className="login-page">
            {/* Top Section with Wave Background (Black Theme) */}
            <div className="login-hero-section">
                <div className="hero-pattern-overlay"></div>
                {/* SVG Wave Shape */}
                <svg className="hero-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#FFFFFF" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            <div className="login-content-wrapper">
                <div className="login-text-area">
                    <h1 className="login-title">
                        Welcome
                    </h1>
                    <p className="login-subtitle">
                        Automatically organize and track your MBA interview calls, shortlists, and exam schedules.
                    </p>
                </div>

                <button
                    className="google-signin-btn"
                    onClick={() => login()}
                    disabled={isLoading}
                    aria-label="Sign in with Google"
                >
                    <div className="google-icon-wrapper">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="google-icon-svg">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                    </div>
                    <span className="google-btn-text">Continue with Google</span>
                </button>
            </div>
        </div>
    );
};

export default Login;
