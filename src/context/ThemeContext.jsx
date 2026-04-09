import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = 'taskyy-theme';

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        try {
            const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
            if (saved === 'dark' || saved === 'light') {
                return saved === 'dark';
            }
        } catch {
            // Ignore storage access errors and fall back to system preference.
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', darkMode);
        root.style.colorScheme = darkMode ? 'dark' : 'light';

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
        } catch {
            // Ignore storage access errors; theme still applies for the current session.
        }
    }, [darkMode]);

    const toggleTheme = useCallback(() => {
        setDarkMode((currentMode) => !currentMode);
    }, []);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
