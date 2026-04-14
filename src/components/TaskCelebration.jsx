import React, { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PartyPopper, Sparkles } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

const burstParticles = [
    { emoji: '🎉', x: -78, y: -48, rotate: -18 },
    { emoji: '✨', x: -26, y: -82, rotate: 8 },
    { emoji: '🎊', x: 24, y: -70, rotate: 18 },
    { emoji: '💜', x: 82, y: -36, rotate: 12 },
    { emoji: '⚡', x: -62, y: 36, rotate: -10 },
    { emoji: '💪', x: 74, y: 34, rotate: 16 },
];

const TaskCelebration = () => {
    const { celebration, dismissCelebration } = useTaskContext();

    useEffect(() => {
        if (!celebration) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            dismissCelebration();
        }, 2600);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [celebration, dismissCelebration]);

    const particles = useMemo(() => burstParticles, []);

    return (
        <AnimatePresence>
            {celebration && (
                <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.96 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="pointer-events-none fixed inset-x-0 top-6 z-[70] flex justify-center px-4"
                >
                    <div className="relative overflow-visible rounded-3xl border border-accent/20 bg-[#130d24]/95 px-6 py-5 text-white shadow-[0_18px_60px_rgba(124,58,237,0.35)] backdrop-blur">
                        {particles.map((particle, index) => (
                            <motion.span
                                key={`${particle.emoji}-${index}`}
                                initial={{ opacity: 0, scale: 0.3, x: 0, y: 0, rotate: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0.4, 1, 0.9],
                                    x: particle.x,
                                    y: particle.y,
                                    rotate: particle.rotate,
                                }}
                                transition={{ duration: 1.4, delay: index * 0.04, ease: 'easeOut' }}
                                className="absolute left-1/2 top-1/2 text-2xl"
                                aria-hidden="true"
                            >
                                {particle.emoji}
                            </motion.span>
                        ))}

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent-light">
                                <PartyPopper size={22} />
                            </div>
                            <div>
                                <p className="flex items-center gap-2 text-lg font-bold font-outfit">
                                    Great job! Keep it up! 💪
                                    <Sparkles size={16} className="text-accent-light" />
                                </p>
                                <p className="mt-1 text-sm text-white/70">
                                    {celebration.taskTitle} is now complete. Momentum looks good today.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TaskCelebration;
