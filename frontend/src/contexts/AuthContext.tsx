import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';

 
interface User {
    userId: string;
    email: string;
    fullName: string;
    role: 'student' | 'teacher' | 'therapist' | 'parent' | 'admin';
    languagePreference: string;
}

 
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    role: string;
    phone?: string;
    schoolCode?: string;
    languagePreference?: string;
}

 
const AuthContext = createContext<AuthContextType | undefined>(undefined);

 
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

     
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await authAPI.getProfile();
                    setUser(response.data.data.user);
                } catch (error) {
                     
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

     
    const login = async (email: string, password: string) => {
        const response = await authAPI.login({ email, password });
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
    };

     
    const register = async (data: RegisterData) => {
        const response = await authAPI.register(data);
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
    };

     
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await authAPI.logout(refreshToken || undefined);
        } catch (error) {
             
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

 
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
