import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'ta' | 'te';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTranslations(language);
    }, [language]);

    async function loadTranslations(lang: Language) {
        setLoading(true);
        try {
            const response = await fetch(`/locales/${lang}/translation.json`);
            if (response.ok) {
                const data = await response.json();
                setTranslations(data);
            } else {
                console.error(`Failed to load translations for ${lang}`);
                // Fallback to empty or English could go here
            }
        } catch (error) {
            console.error('Error loading translations:', error);
        } finally {
            setLoading(false);
        }
    }

    const t = (key: string) => {
        // Support nested keys if needed, but simple key lookup for now
        return translations[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
