import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge, Button } from './ui/Base';

const formatSeconds = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
    const remainingSeconds = String(safeSeconds % 60).padStart(2, '0');

    return `${minutes}:${remainingSeconds}`;
};

const TwoFactorAuth = () => {
    const navigate = useNavigate();
    const {
        pendingTwoFactor,
        resetTwoFactorAuth,
        verifyTwoFactorCode,
    } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [remainingSeconds, setRemainingSeconds] = useState(() => {
        if (!pendingTwoFactor?.expiresAt) {
            return 0;
        }

        return Math.max(0, Math.ceil((pendingTwoFactor.expiresAt - Date.now()) / 1000));
    });

    useEffect(() => {
        if (!pendingTwoFactor?.expiresAt) {
            setRemainingSeconds(0);
            return undefined;
        }

        const updateRemainingSeconds = () => {
            setRemainingSeconds(Math.max(0, Math.ceil((pendingTwoFactor.expiresAt - Date.now()) / 1000)));
        };

        updateRemainingSeconds();
        const intervalId = window.setInterval(updateRemainingSeconds, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [pendingTwoFactor]);

    const progressValue = useMemo(() => (
        pendingTwoFactor?.expiresAt ? Math.max(0, (remainingSeconds / 60) * 100) : 0
    ), [pendingTwoFactor, remainingSeconds]);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();

        const result = verifyTwoFactorCode(code);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setError('');
        navigate('/', { replace: true });
    }, [code, navigate, verifyTwoFactorCode]);

    const handleCodeChange = useCallback((event) => {
        const sanitizedValue = event.target.value.replace(/\D/g, '').slice(0, 4);
        setCode(sanitizedValue);
        setError('');
    }, []);

    const handleBackToLogin = useCallback(() => {
        resetTwoFactorAuth();
        setCode('');
        setError('');
    }, [resetTwoFactorAuth]);

    if (!pendingTwoFactor) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Enter the 4-digit verification code</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            The code is valid for one minute and unlocks the dashboard after verification.
                        </p>
                    </div>
                </div>
                <Badge variant={remainingSeconds > 10 ? 'primary' : 'warning'} className="px-3 py-1">
                    <Clock3 size={12} />
                    {formatSeconds(remainingSeconds)}
                </Badge>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                        remainingSeconds > 10 ? 'bg-accent' : 'bg-orange-500'
                    }`}
                    style={{ width: `${progressValue}%` }}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="two-factor-code" className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                        Verification code
                    </label>
                    <input
                        id="two-factor-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={code}
                        onChange={handleCodeChange}
                        placeholder="0000"
                        disabled={remainingSeconds === 0}
                        className="w-full rounded-2xl border border-transparent bg-gray-100 px-4 py-4 text-center font-outfit text-3xl font-bold tracking-[0.45em] text-gray-900 outline-none transition-all focus:border-accent dark:bg-gray-900 dark:text-white"
                    />
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
                        {error}
                    </div>
                )}

                {remainingSeconds === 0 && (
                    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm font-medium text-orange-600 dark:text-orange-300">
                        Code expired. Go back and generate a fresh code.
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={code.length !== 4 || remainingSeconds === 0}
                        className="flex-1 rounded-2xl py-3.5"
                    >
                        Verify & Open Dashboard
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleBackToLogin}
                        className="rounded-2xl px-6"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default TwoFactorAuth;
