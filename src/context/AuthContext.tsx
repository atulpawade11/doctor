import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/apiService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const AUTH_TOKEN_KEY = import.meta.env.REACT_APP_AUTH_TOKEN_KEY ||
        import.meta.env.VITE_AUTH_TOKEN_KEY ||
        'authToken';

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await authAPI.getProfile();
            if (data) {
                setIsAuthenticated(true);
                setUser(data.user);
            }
        } catch {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
        setLoading(false);
    };

    const login = async (email: string, password: string) => {
        try {
            const { data, error } = await authAPI.login(email, password);

            if (data?.token) {
                localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                setIsAuthenticated(true);

                // Get user profile
                const profileResponse = await authAPI.getProfile();
                if (profileResponse.data) {
                    setUser(profileResponse.data.user);
                }

                return { success: true, message: 'Login successful' };
            }
            return { success: false, message: error || 'Login failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/signin';
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};