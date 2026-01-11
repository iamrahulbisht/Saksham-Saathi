import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/indexedDB'; // Dexie instance
import api from '../services/api';

interface User { userId: string; role: string; email: string; fullName?: string; }

const AuthContext = createContext<{
    user: User | null;
    login: (email: string, password: string) => Promise<User>;
    register: (data: any) => Promise<User>;
    logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // On app load, first check memory/state, then check offline cache
        loadCachedUser();
    }, []);

    async function loadCachedUser() {
        try {
            // Check IndexedDB for a cached user session from previous login
            const cachedUser = await db.users.get('current_user');
            if (cachedUser) {
                setUser(cachedUser);
            }
        } catch (e) {
            console.error("Failed to load cached user", e);
        }
    }

    async function login(email: string, password: string) {
        // 1. Perform online login
        const response = await api.post('/auth/login', { email, password });
        const { user, access_token, refresh_token } = response.data;

        // 2. persist tokens for API calls
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // 3. Cache user profile in IndexedDB for offline access
        // We use 'current_user' as a fixed key for simplicity
        await db.users.put({ id: 'current_user', ...user });

        // 4. Update State
        setUser(user);
        return user;
    }

    async function register(data: any) {
        const response = await api.post('/auth/register', data);
        const { user, access_token, refresh_token } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        await db.users.put({ id: 'current_user', ...user });

        setUser(user);
        return user;
    }

    function logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        db.users.delete('current_user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
