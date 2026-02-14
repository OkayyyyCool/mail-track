import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { googleLogout, useGoogleLogin, type TokenResponse } from '@react-oauth/google';
import axios from 'axios';
import { initClient } from '../services/gmail';
import { gapi } from 'gapi-script';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    picture: string;
}

interface AuthContextType {
    user: UserProfile | null;
    accessToken: string | null;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
    isGapiReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize state from localStorage if available
    const [user, setUser] = useState<UserProfile | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [accessToken, setAccessToken] = useState<string | null>(() => {
        return localStorage.getItem('accessToken');
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isGapiReady, setIsGapiReady] = useState(false);

    useEffect(() => {
        // Initialize GAPI client for Gmail API calls
        // Initialize GAPI client for Gmail API calls
        initClient(() => {
            console.log("GAPI Client Initialized");
            // If we have a token in storage, verify/restore it for GAPI
            if (accessToken && typeof gapi !== 'undefined' && gapi.client) {
                gapi.client.setToken({ access_token: accessToken });
            }
            setIsGapiReady(true);
        });
    }, [accessToken]);

    const login = useGoogleLogin({
        onSuccess: (tokenResponse: TokenResponse) => {
            const token = tokenResponse.access_token;
            setAccessToken(token);
            localStorage.setItem('accessToken', token); // Persist Token

            // CRITICAL: Set the token for GAPI client to use in Gmail API calls
            if (typeof gapi !== 'undefined' && gapi.client) {
                gapi.client.setToken({ access_token: token });
            }
            fetchUserProfile(token);
        },
        onError: (error) => console.log('Login Failed:', error),
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
    });

    const logout = () => {
        googleLogout();
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        if (typeof gapi !== 'undefined' && gapi.client) {
            gapi.client.setToken(null);
        }
    };

    const fetchUserProfile = async (token: string) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data)); // Persist User
        } catch (err) {
            console.error(err);
            // If fetching profile fails (e.g. expired token), clear storage
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading, isGapiReady }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
