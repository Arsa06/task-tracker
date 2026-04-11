import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import withAuth from '../hoc/withAuth';

const routerFuture = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
};

const SecretComponent = ({ label }) => (
    <div>Secret task area: {label}</div>
);

const ProtectedSecretComponent = withAuth(SecretComponent);

describe('withAuth', () => {
    it('renders the wrapped component when the user is authenticated', () => {
        render(
            <MemoryRouter future={routerFuture}>
                <AuthProvider initialAuthenticated>
                    <ProtectedSecretComponent label="Task 42" />
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByText('Secret task area: Task 42')).toBeInTheDocument();
    });

    it('renders the restricted message when the user is not authenticated', () => {
        render(
            <MemoryRouter future={routerFuture}>
                <AuthProvider initialAuthenticated={false}>
                    <ProtectedSecretComponent label="Task 42" />
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByText('Доступ ограничен')).toBeInTheDocument();
        expect(screen.queryByText('Secret task area: Task 42')).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Перейти в профиль/i })).toBeInTheDocument();
    });

    it('passes props through to the wrapped component', () => {
        render(
            <MemoryRouter future={routerFuture}>
                <AuthProvider initialAuthenticated>
                    <ProtectedSecretComponent label="Protected payload" />
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByText('Secret task area: Protected payload')).toBeInTheDocument();
    });
});
