import React from 'react';
import { Compass, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui/Base';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <Card className="relative w-full max-w-2xl overflow-hidden border-none bg-gradient-to-br from-dark-card via-dark-bg to-gray-950 p-10 text-white shadow-2xl shadow-accent/20">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/25 blur-3xl" />
                <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="relative z-10 text-center">
                    <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
                        <Compass size={32} className="text-accent-light" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent-light">Taskyy</p>
                    <p className="mt-4 text-7xl font-black tracking-tight text-accent-light sm:text-8xl">404</p>
                    <h1 className="mt-3 text-4xl font-bold font-outfit">Page Not Found</h1>
                    <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-300">
                        Oops! The page you're looking for doesn't exist.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Button
                            type="button"
                            onClick={() => navigate('/')}
                            className="rounded-2xl px-6 py-3"
                        >
                            <Home size={18} /> Go Home
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default NotFound;
