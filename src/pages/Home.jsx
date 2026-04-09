import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Card, Button, Badge } from '../components/ui/Base';
import LazyModal from '../lazy/LazyModal';
import TaskForm from '../components/TaskForm';
import { useModal } from '../hooks/useModal';
import { 
    CheckCircle2, 
    Clock, 
    TrendingUp, 
    ArrowRight,
    Star,
    Zap,
    ListTodo,
    Plus
} from 'lucide-react';
import { format, isToday, parseISO, isPast } from 'date-fns';
import { Link } from 'react-router-dom';

const Home = () => {
    const { tasks, loading } = useTaskContext();
    const addModal = useModal(false);

    if (loading) return <div className="animate-pulse flex flex-col gap-8">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>)}
        </div>
    </div>;

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const todayTasks = tasks.filter(t => t.deadline && isToday(parseISO(t.deadline)));
    const pendingToday = todayTasks.filter(t => !t.completed);

    const stats = [
        { label: 'Total Tasks', value: total, icon: <ListTodo size={24} />, color: 'bg-blue-500' },
        { label: 'Completed', value: completed, icon: <CheckCircle2 size={24} />, color: 'bg-green-500' },
        { label: 'Progress', value: `${completionRate}%`, icon: <TrendingUp size={24} />, color: 'bg-accent' },
        { label: 'Today', value: pendingToday.length, icon: <Clock size={24} />, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Welcome Header */}
            <div>
                <h2 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white mb-1">
                    Welcome back, Arsen! 👋
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    You have <span className="text-accent font-semibold">{pendingToday.length} tasks</span> to focus on today.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl text-white ${stat.color} shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Focus */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
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
                        {pendingToday.length > 0 ? pendingToday.map(task => (
                            <Card key={task.id} className="p-4 hover:border-accent/40 group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-10 rounded-full ${
                                        task.priority === 'High' ? 'bg-red-500' : 
                                        task.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                                    }`} />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge variant={task.priority === 'High' ? 'danger' : 'neutral'}>
                                                {task.priority}
                                            </Badge>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock size={12} /> {format(parseISO(task.deadline), 'p')}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100">
                                        Open
                                    </Button>
                                </div>
                            </Card>
                        )) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                <Star className="mx-auto text-gray-300 mb-2" size={40} />
                                <p className="text-gray-500">No urgent tasks for today. Relax!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress & Circular Dashboard */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-accent to-indigo-600 text-white border-none shadow-xl shadow-accent/20">
                        <h3 className="font-bold font-outfit text-lg mb-6">Weekly Progress</h3>
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="relative w-40 h-40">
                                {/* Circular Progress SVG */}
                                <svg className="w-full h-full transform -rotate-90">
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
                                        className="text-white transition-all duration-1000"
                                        strokeWidth="10"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * completionRate) / 100}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="70"
                                        cx="80"
                                        cy="80"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold">{completionRate}%</span>
                                    <span className="text-[10px] uppercase font-bold opacity-80">Completed</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm opacity-90 mb-2">You've completed {completed} tasks this week!</p>
                                <Badge variant="primary" className="bg-white/20 text-white border-none">Keep it up!</Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Upcoming Deadlines Widget */}
                    <Card className="p-6">
                        <h3 className="font-bold font-outfit mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-accent" />
                            Upcoming Deadlines
                        </h3>
                        <div className="space-y-4">
                            {tasks
                                .filter(t => !t.completed && t.deadline && !isToday(parseISO(t.deadline)) && !isPast(parseISO(t.deadline)))
                                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                                .slice(0, 3)
                                .map(task => (
                                    <div key={task.id} className="flex items-center gap-3">
                                        <div className="w-1 h-8 rounded-full bg-gray-200 dark:bg-gray-800" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate dark:text-white">{task.title}</p>
                                            <p className="text-[10px] text-gray-500">{format(parseISO(task.deadline), 'MMM d, p')}</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </Card>
                </div>
            </div>

            {/* Quick Add FAB */}
            <div className="fixed bottom-8 right-8 z-40">
                <Button 
                    onClick={() => addModal.open()}
                    className="w-14 h-14 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all p-0"
                >
                    <Plus size={28} />
                </Button>
            </div>

            {/* Modal */}
            <LazyModal isOpen={addModal.isOpen} onClose={addModal.close} title="Quick Add Task">
                <TaskForm onSuccess={addModal.close} />
            </LazyModal>
        </div>
    );
};

export default Home;
