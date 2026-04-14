import React, { useCallback, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    LockKeyhole,
    Moon,
    ShieldCheck,
    Sparkles,
    Sun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Badge, Button, Card } from '../components/ui/Base';
import TwoFactorAuth from '../components/TwoFactorAuth';

const LoginPage = () => {
    const {
        demoCredentials,
        isAuthenticated,
        pendingTwoFactor,
        startTwoFactorAuth,
    } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const [formValues, setFormValues] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');

    const loginHighlights = useMemo(() => ([
        'Secure 2FA login for dashboard, tasks, calendar, and profile.',
        'AI-ready workspace for planning, prioritizing, and task analysis.',
        'Beautiful purple Taskyy interface with productivity insights built in.',
    ]), []);

    const previewExpiryTime = useMemo(() => {
        if (!pendingTwoFactor?.expiresAt) {
            return '';
        }

        return new Date(pendingTwoFactor.expiresAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }, [pendingTwoFactor]);

    const handleChange = useCallback((event) => {
        const { name, value } = event.target;
        setFormValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
        setError('');
    }, []);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();

        const result = startTwoFactorAuth(formValues);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setError('');
    }, [formValues, startTwoFactorAuth]);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#090611] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(167,139,250,0.18),_transparent_30%),linear-gradient(160deg,_#0a0714,_#160f2d_55%,_#0f0a1f)]" />
            <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />

            <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:gap-8 lg:px-8">
                <div className="mb-8 flex items-start justify-between gap-4 lg:mb-0 lg:pr-6">
                    <div className="max-w-xl space-y-6">
                        <Badge className="border border-white/10 bg-white/10 px-4 py-1 text-[11px] tracking-[0.28em] text-white">
                            TASKYY SECURITY PORTAL
                        </Badge>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30">
                                    <ShieldCheck size={30} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-light">Taskyy</p>
                                    <h1 className="text-4xl font-bold font-outfit sm:text-5xl">
                                        Secure your workflow before you sprint.
                                    </h1>
                                </div>
                            </div>
                            <p className="max-w-lg text-base leading-8 text-white/75 sm:text-lg">
                                Sign in with the demo account, receive a timed 4-digit code, and unlock your dashboard,
                                AI assistant, and protected task space with the Taskyy purple glow.
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {loginHighlights.map((item) => (
                                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                                    <Sparkles size={18} className="mt-0.5 shrink-0 text-accent-light" />
                                    <p className="text-sm leading-7 text-white/80">{item}</p>
                                </div>
                            ))}
                        </div>

                        <Card className="border-white/10 bg-white/10 p-5 text-white shadow-2xl shadow-black/10 backdrop-blur-md dark:bg-white/10">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent-light">Demo Credentials</p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Username</p>
                                    <p className="mt-1 font-semibold">{demoCredentials.username}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Password</p>
                                    <p className="mt-1 font-semibold">{demoCredentials.password}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={toggleTheme}
                        className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-4 text-white hover:bg-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                    >
                        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                        {darkMode ? 'Light View' : 'Dark View'}
                    </Button>
                </div>

                <Card className="overflow-hidden border-white/10 bg-white/95 p-0 shadow-[0_30px_100px_rgba(0,0,0,0.35)] dark:bg-[#151124]/95">
                    <div className="border-b border-gray-100 bg-gradient-to-r from-accent via-violet-600 to-indigo-600 p-6 text-white dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                                <LockKeyhole size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                                    {pendingTwoFactor ? 'Step 2 of 2' : 'Step 1 of 2'}
                                </p>
                                <h2 className="text-2xl font-bold font-outfit">
                                    {pendingTwoFactor ? 'Verify your 2FA code' : 'Login to Taskyy'}
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 p-6 sm:p-8">
                        {pendingTwoFactor ? (
                            <>
                                <div className="rounded-3xl border border-accent/20 bg-accent/5 p-5 text-gray-700 dark:bg-accent/10 dark:text-white">
                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent-light">
                                        Demo verification code
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                                        <div>
                                            <p className="text-4xl font-bold tracking-[0.35em] text-accent">
                                                {pendingTwoFactor.code}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-white/65">
                                                This simulates the SMS or email code for the final project.
                                            </p>
                                        </div>
                                        <Badge variant="primary" className="px-3 py-1 text-[11px]">
                                            Expires at {previewExpiryTime}
                                        </Badge>
                                    </div>
                                </div>
                                <TwoFactorAuth />
                            </>
                        ) : (
                            <>
                                <div>
                                    <p className="text-sm leading-7 text-gray-500 dark:text-gray-300">
                                        Use the demo account below. On a successful login, Taskyy generates a random
                                        4-digit code and moves you into the verification step.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="username" className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                                            Username
                                        </label>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={formValues.username}
                                            onChange={handleChange}
                                            placeholder="Enter username"
                                            autoComplete="username"
                                            className="w-full rounded-2xl border border-transparent bg-gray-100 px-4 py-3.5 text-gray-900 outline-none transition-all focus:border-accent dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formValues.password}
                                            onChange={handleChange}
                                            placeholder="Enter password"
                                            autoComplete="current-password"
                                            className="w-full rounded-2xl border border-transparent bg-gray-100 px-4 py-3.5 text-gray-900 outline-none transition-all focus:border-accent dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {error && (
                                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" size="lg" className="w-full rounded-2xl py-3.5">
                                        Generate 2FA Code
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
