import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AIAssistant from '../AIAssistant';
import TaskCelebration from '../TaskCelebration';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-dark-bg lg:flex">
            <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
                    isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                }`}
                aria-label="Close navigation backdrop"
            />

            <Sidebar
                isMobileOpen={isSidebarOpen}
                onCloseMobile={() => setIsSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-dark-card/90 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="Open navigation"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-light">Taskyy</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Stay on track</p>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.24, ease: 'easeOut' }}
                            className="mx-auto max-w-6xl"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <AIAssistant />
                <TaskCelebration />
            </div>
        </div>
    );
};

export default Layout;
