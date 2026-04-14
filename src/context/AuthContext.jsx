import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'taskyy-is-authenticated';
const TWO_FACTOR_DURATION_MS = 60_000;

const DEMO_CREDENTIALS = {
    username: 'arsen',
    password: 'taskyy2026',
};

const readStoredAuthentication = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

        if (storedValue === null) {
            return null;
        }

        return JSON.parse(storedValue) === true;
    } catch {
        return null;
    }
};

const generateVerificationCode = () => (
    String(Math.floor(1000 + Math.random() * 9000))
);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export const AuthProvider = ({
    children,
    initialAuthenticated = true,
    hydrateFromStorage = false,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (hydrateFromStorage) {
            const storedAuthentication = readStoredAuthentication();

            if (typeof storedAuthentication === 'boolean') {
                return storedAuthentication;
            }
        }

        return initialAuthenticated;
    });
    const [pendingTwoFactor, setPendingTwoFactor] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            if (isAuthenticated) {
                window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(true));
            } else {
                window.localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        } catch {
            // Ignore storage errors and keep auth state available in memory.
        }
    }, [isAuthenticated]);

    const login = useCallback(() => {
        setPendingTwoFactor(null);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        setPendingTwoFactor(null);
        setIsAuthenticated(false);
    }, []);

    const toggleAuthentication = useCallback(() => {
        setPendingTwoFactor(null);
        setIsAuthenticated((prev) => !prev);
    }, []);

    const startTwoFactorAuth = useCallback(({ username, password }) => {
        const normalizedUsername = username.trim().toLowerCase();
        const normalizedPassword = password.trim();

        if (
            normalizedUsername !== DEMO_CREDENTIALS.username
            || normalizedPassword !== DEMO_CREDENTIALS.password
        ) {
            return {
                success: false,
                error: 'Invalid username or password',
            };
        }

        const nextChallenge = {
            code: generateVerificationCode(),
            username: normalizedUsername,
            expiresAt: Date.now() + TWO_FACTOR_DURATION_MS,
        };

        setPendingTwoFactor(nextChallenge);
        setIsAuthenticated(false);

        return {
            success: true,
            code: nextChallenge.code,
            expiresAt: nextChallenge.expiresAt,
        };
    }, []);

    const verifyTwoFactorCode = useCallback((submittedCode) => {
        const sanitizedCode = submittedCode.trim();

        if (!pendingTwoFactor) {
            return {
                success: false,
                error: 'Generate a new code before verifying.',
            };
        }

        if (Date.now() > pendingTwoFactor.expiresAt) {
            setPendingTwoFactor(null);

            return {
                success: false,
                error: 'Code expired. Please request a new one.',
            };
        }

        if (sanitizedCode !== pendingTwoFactor.code) {
            return {
                success: false,
                error: 'Invalid code, try again',
            };
        }

        setPendingTwoFactor(null);
        setIsAuthenticated(true);

        return { success: true };
    }, [pendingTwoFactor]);

    const resetTwoFactorAuth = useCallback(() => {
        setPendingTwoFactor(null);
    }, []);

    const value = useMemo(() => ({
        isAuthenticated,
        login,
        logout,
        toggleAuthentication,
        demoCredentials: DEMO_CREDENTIALS,
        pendingTwoFactor,
        startTwoFactorAuth,
        verifyTwoFactorCode,
        resetTwoFactorAuth,
    }), [
        isAuthenticated,
        login,
        logout,
        pendingTwoFactor,
        resetTwoFactorAuth,
        startTwoFactorAuth,
        toggleAuthentication,
        verifyTwoFactorCode,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
    hydrateFromStorage: PropTypes.bool,
    initialAuthenticated: PropTypes.bool,
};
