import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    LayoutDashboard,
    ListTodo,
    LogOut,
    Moon,
    ShieldCheck,
    Sun,
    User,
    X,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTaskContext } from '../../context/TaskContext';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useTheme();
    const { isAuthenticated, logout } = useAuth();
    const { tasks } = useTaskContext();
    const today = new Date();

    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Tasks', path: '/tasks', icon: <ListTodo size={20} />, badge: tasks.length },
        { name: 'Calendar', path: '/calendar', icon: <CalendarIcon size={20} /> },
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 dark:border-gray-800 dark:bg-dark-card lg:sticky lg:top-0 lg:w-64 lg:translate-x-0 lg:shadow-none ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">Taskyy</h1>
                </div>
                <button
                    type="button"
                    onClick={onCloseMobile}
                    className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
                    aria-label="Close navigation"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={onCloseMobile}
                        className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                            isActive
                                ? 'bg-accent/10 font-semibold text-accent'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white'
                        }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                        {typeof item.badge === 'number' && (
                            <span className="ml-auto rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {format(today, 'MMMM yyyy')}
                    </span>
                </div>
                <div className="mb-2 grid grid-cols-7 gap-1 text-[10px] pointer-events-none">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                        <span key={day} className="text-center font-medium text-gray-400">{day}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {[...Array(monthStart.getDay())].map((_, index) => (
                        <div key={`empty-${index}`} />
                    ))}
                    {days.map((day) => (
                        <div
                            key={day.toString()}
                            className={`aspect-square flex items-center justify-center rounded-md text-[10px] ${
                                isSameDay(day, today)
                                    ? 'bg-accent font-bold text-white'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            {format(day, 'd')}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 p-4 dark:border-gray-800">
                <button
                    onClick={toggleTheme}
                    className="group flex w-full items-center justify-between rounded-xl bg-gray-100 px-4 py-3 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                    <div className="flex items-center gap-3">
                        {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-accent" />}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </div>
                    <div className={`relative h-5 w-10 rounded-full transition-colors ${darkMode ? 'bg-accent' : 'bg-gray-400'}`}>
                        <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        logout();
                        onCloseMobile();
                        navigate('/login', { replace: true });
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                        isAuthenticated
                            ? 'border-accent/20 bg-accent/10 text-accent hover:bg-accent/15'
                            : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <LogOut size={16} />
                        {isAuthenticated ? 'Logout' : 'Go to login'}
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${isAuthenticated ? 'bg-accent' : 'bg-gray-400 dark:bg-gray-500'}`} />
                </button>
            </div>
        </aside>
    );
};

Sidebar.propTypes = {
    isMobileOpen: PropTypes.bool,
    onCloseMobile: PropTypes.func,
};

Sidebar.defaultProps = {
    isMobileOpen: false,
    onCloseMobile: () => {},
};

export default Sidebar;
