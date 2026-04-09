import React from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const withAuth = (WrappedComponent) => {
    const ComponentWithAuth = (props) => {
        const { isAuthenticated } = useAuth();

        if (!isAuthenticated) {
            return (
                <div className="min-h-[50vh] grid place-items-center">
                    <div className="max-w-md rounded-3xl border border-orange-200 bg-orange-50 p-8 text-center shadow-sm dark:border-orange-900/40 dark:bg-orange-950/30">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                            <LockKeyhole size={26} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Доступ ограничен</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Для просмотра этой страницы требуется авторизация.
                        </p>
                        <Link
                            to="/profile"
                            className="mt-5 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
                        >
                            Перейти в профиль
                        </Link>
                    </div>
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
