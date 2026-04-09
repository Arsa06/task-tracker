import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export const AuthProvider = ({ children, initialAuthenticated = true }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);

    const login = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
    }, []);

    const toggleAuthentication = useCallback(() => {
        setIsAuthenticated((prev) => !prev);
    }, []);

    const value = useMemo(() => ({
        isAuthenticated,
        login,
        logout,
        toggleAuthentication,
    }), [isAuthenticated, login, logout, toggleAuthentication]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
    initialAuthenticated: PropTypes.bool,
};

