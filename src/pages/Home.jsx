import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast, isToday, parseISO } from 'date-fns';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    ListTodo,
    Plus,
    Star,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Card, Button, Badge } from '../components/ui/Base';
import LazyModal from '../lazy/LazyModal';
import TaskForm from '../components/TaskForm';
import { useModal } from '../hooks/useModal';
import { useProfile } from '../context/ProfileContext';

const statCardStyles = {
    'Total Tasks': 'bg-blue-500 shadow-blue-500/20',
    Completed: 'bg-green-500 shadow-green-500/20',
    Progress: 'bg-accent shadow-accent/20',
    Today: 'bg-orange-500 shadow-orange-500/20',
};

const getTimeBasedGreeting = (firstName) => {
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 12) {
        return `Good morning, ${firstName}! ☀️`;
    }

    if (currentHour >= 12 && currentHour < 18) {
        return `Good afternoon, ${firstName}! 👋`;
    }

    if (currentHour >= 18 && currentHour < 24) {
        return `Good evening, ${firstName}! 🌙`;
    }

    return `Working late, ${firstName}? 🌟`;
};

const getScoreTone = (score) => {
    if (score <= 30) {
        return {
            ringClassName: 'text-red-400',
            badgeClassName: 'border-none bg-red-500/20 text-red-100',
            helperLabel: 'Needs focus',
        };
    }

    if (score < 70) {
        return {
            ringClassName: 'text-yellow-300',
            badgeClassName: 'border-none bg-yellow-400/20 text-yellow-50',
            helperLabel: 'Building momentum',
        };
    }

    return {
        ringClassName: 'text-emerald-300',
        badgeClassName: 'border-none bg-emerald-400/20 text-emerald-50',
        helperLabel: 'Excellent rhythm',
    };
};

const Home = () => {
    const { tasks, loading } = useTaskContext();
    const addModal = useModal(false);
    const { profile } = useProfile();
    const firstName = profile.name.split(' ')[0] || profile.name;
    const [animatedStats, setAnimatedStats] = useState({
        total: 0,
        completed: 0,
        progress: 0,
        today: 0,
    });

    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const todayTasks = useMemo(
        () => tasks.filter((task) => task.deadline && isToday(parseISO(task.deadline))),
        [tasks],
    );
    const pendingToday = todayTasks.filter((task) => !task.completed);
    const upcomingDeadlines = useMemo(() => tasks
        .filter((task) => !task.completed && task.deadline && !isToday(parseISO(task.deadline)) && !isPast(parseISO(task.deadline)))
        .sort((leftTask, rightTask) => new Date(leftTask.deadline) - new Date(rightTask.deadline))
        .slice(0, 3), [tasks]);
    const greeting = useMemo(() => getTimeBasedGreeting(firstName), [firstName]);
    const scoreTone = useMemo(() => getScoreTone(completionRate), [completionRate]);

    useEffect(() => {
        const animationDuration = 1000;
        const steps = 40;
        const targets = {
            total,
            completed,
            progress: completionRate,
            today: pendingToday.length,
        };

        let currentStep = 0;
        setAnimatedStats({
            total: 0,
            completed: 0,
            progress: 0,
            today: 0,
        });

        const intervalId = window.setInterval(() => {
            currentStep += 1;
            const progressValue = currentStep / steps;

            setAnimatedStats({
                total: Math.round(targets.total * progressValue),
                completed: Math.round(targets.completed * progressValue),
                progress: Math.round(targets.progress * progressValue),
                today: Math.round(targets.today * progressValue),
            });

            if (currentStep >= steps) {
                window.clearInterval(intervalId);
                setAnimatedStats(targets);
            }
        }, animationDuration / steps);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [completionRate, completed, pendingToday.length, total]);

    const stats = [
        { label: 'Total Tasks', value: animatedStats.total, icon: <ListTodo size={24} /> },
        { label: 'Completed', value: animatedStats.completed, icon: <CheckCircle2 size={24} /> },
        { label: 'Progress', value: `${animatedStats.progress}%`, icon: <TrendingUp size={24} /> },
        { label: 'Today', value: animatedStats.today, icon: <Clock size={24} /> },
    ];

    if (loading) {
        return (
            <div className="flex animate-pulse flex-col gap-8">
                <div className="h-10 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
            </div>
        );
    }

    return (
            <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="mb-1 text-3xl font-bold font-outfit text-gray-900 dark:text-white md:text-4xl">
                    {greeting}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 md:text-base">
                    You have <span className="font-semibold text-accent">{pendingToday.length} tasks</span> to focus on today.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-4 md:p-6">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-xl p-3 text-white shadow-lg ${statCardStyles[stat.label]}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="flex items-center gap-2 text-xl font-bold font-outfit text-gray-900 dark:text-white">
                            <Zap size={20} className="text-yellow-500" />
                            Today's Focus
                        </h3>
                        <Link to="/tasks">
                            <Button variant="ghost" size="sm" className="text-accent">
                                View all <ArrowRight size={16} />
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingToday.length > 0 ? pendingToday.map((task) => (
                            <Card key={task.id} className="group p-4 hover:border-accent/40">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-2 rounded-full ${
                                        task.priority === 'High'
                                            ? 'bg-red-500'
                                            : task.priority === 'Medium'
                                                ? 'bg-orange-500'
                                                : 'bg-green-500'
                                    }`} />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                                        <div className="mt-1 flex items-center gap-3">
                                            <Badge variant={task.priority === 'High' ? 'danger' : 'neutral'}>
                                                {task.priority}
                                            </Badge>
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Clock size={12} /> {format(parseISO(task.deadline), 'p')}
                                            </span>
                                        </div>
                                    </div>
                                    <Link to={`/tasks/${task.id}`}>
                                        <Button variant="outline" size="sm" className="opacity-0 transition-opacity group-hover:opacity-100">
                                            Open
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        )) : (
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
                                <Star className="mx-auto mb-2 text-gray-300" size={40} />
                                <p className="text-gray-500">No tasks for today. Enjoy your day! {'\uD83C\uDF89'}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-none bg-gradient-to-br from-[#181126] via-[#261549] to-[#120c20] p-6 text-white shadow-xl shadow-accent/20">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold font-outfit">Productivity Score</h3>
                                <p className="mt-1 text-sm text-white/65">
                                    Completed tasks divided by your full task list.
                                </p>
                            </div>
                            <Badge className={scoreTone.badgeClassName}>
                                {scoreTone.helperLabel}
                            </Badge>
                        </div>
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="relative h-40 w-40">
                                <svg className="h-full w-full -rotate-90 transform">
                                    <circle
                                        className="text-white/20"
                                        strokeWidth="10"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="70"
                                        cx="80"
                                        cy="80"
                                    />
                                    <circle
                                        className={`${scoreTone.ringClassName} transition-all duration-1000`}
                                        strokeWidth="10"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * animatedStats.progress) / 100}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="70"
                                        cx="80"
                                        cy="80"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold">{animatedStats.progress}%</span>
                                    <span className="text-[10px] font-bold uppercase opacity-80">Score</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="mb-2 text-sm opacity-90">
                                    You've completed {completed} of {total} tasks and your pace looks {scoreTone.helperLabel.toLowerCase()}.
                                </p>
                                <Badge variant="primary" className="border-none bg-white/20 text-white">
                                    Great job! Keep it up! 💪
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-bold font-outfit">
                            <Clock size={18} className="text-accent" />
                            Upcoming Deadlines
                        </h3>
                        <div className="space-y-4">
                            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((task) => (
                                <div key={task.id} className="flex items-center gap-3">
                                    <div className="h-8 w-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold dark:text-white">{task.title}</p>
                                        <p className="text-[10px] text-gray-500">{format(parseISO(task.deadline), 'MMM d, p')}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up. No upcoming deadlines right now.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8">
                <Button
                    onClick={() => addModal.open()}
                    className="h-14 w-14 rounded-2xl p-0 shadow-2xl transition-all hover:scale-110 active:scale-95"
                >
                    <Plus size={28} />
                </Button>
            </div>

            <LazyModal isOpen={addModal.isOpen} onClose={addModal.close} title="Quick Add Task">
                <TaskForm onSuccess={addModal.close} />
            </LazyModal>
        </div>
    );
};

export default Home;
