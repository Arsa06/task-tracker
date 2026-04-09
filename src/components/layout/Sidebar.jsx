import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ListTodo, 
    Calendar as CalendarIcon, 
    User, 
    ShieldCheck, 
    Moon, 
    Sun,
    PlusCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const Sidebar = () => {
    const { darkMode, toggleTheme } = useTheme();
    const today = new Date();
    
    // Mini Calendar Logic
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Tasks', path: '/tasks', icon: <ListTodo size={20} /> },
        { name: 'Calendar', path: '/calendar', icon: <CalendarIcon size={20} /> },
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    ];

    return (
        <aside className="w-64 h-screen sticky top-0 flex flex-col bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 transition-colors duration-300">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                    <ShieldCheck className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">Taskyy</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive 
                                ? 'bg-accent/10 text-accent font-semibold' 
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
                        `}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Mini Calendar */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {format(today, 'MMMM yyyy')}
                    </span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[10px] mb-2 pointer-events-none">
                    {['S','M','T','W','T','F','S'].map(d => (
                        <span key={d} className="text-center text-gray-400 font-medium">{d}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {/* Add empty slots for the first week if month doesn't start on Sunday */}
                    {[...Array(monthStart.getDay())].map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {days.map((day) => (
                        <div 
                            key={day.toString()}
                            className={`
                                aspect-square flex items-center justify-center rounded-md text-[10px]
                                ${isSameDay(day, today) 
                                    ? 'bg-accent text-white font-bold' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
                            `}
                        >
                            {format(day, 'd')}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / Theme Toggle */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                    onClick={toggleTheme}
                    className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 group"
                >
                    <div className="flex items-center gap-3">
                        {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-accent" />}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-accent' : 'bg-gray-400'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
