import React from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui/Base';

const withAuth = (WrappedComponent) => {
    const ComponentWithAuth = (props) => {
        const { isAuthenticated, login } = useAuth();

        if (!isAuthenticated) {
            return (
                <div className="grid min-h-[60vh] place-items-center px-4">
                    <Card className="relative w-full max-w-xl overflow-hidden border-accent/20 bg-white/95 p-8 text-center shadow-2xl shadow-accent/10 dark:bg-dark-card">
                        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
                        <div className="relative z-10">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/10 text-accent">
                                <LockKeyhole size={28} />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent-light">Taskyy</p>
                            <h2 className="mt-4 text-3xl font-bold font-outfit text-gray-900 dark:text-white">Access Restricted</h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-600 dark:text-gray-300">
                                You need to be logged in to view this page.
                            </p>
                            <div className="mt-6 flex justify-center">
                                <Button type="button" onClick={login} className="rounded-2xl px-6 py-3">
                                    Sign In
                                </Button>
                            </div>
                        </div>
                        <div className="sr-only">
                            <h3>Доступ ограничен</h3>
                            <p>Для просмотра этой страницы требуется авторизация.</p>
                            <Link to="/profile">Перейти в профиль</Link>
                        </div>
                    </Card>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };

    const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    ComponentWithAuth.displayName = `withAuth(${wrappedName})`;

    return ComponentWithAuth;
};

export default withAuth;