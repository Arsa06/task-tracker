import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md', 
    ...props 
}) => {
    const variants = {
        primary: 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20',
        secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
        outline: 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
        ghost: 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button 
            className={twMerge(
                'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className, ...props }) => (
    <div 
        className={twMerge(
            'bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm transition-all duration-300',
            className
        )}
        {...props}
    >
        {children}
    </div>
);

export const Badge = ({ 
    children, 
    className, 
    variant = 'neutral' 
}) => {
    const variants = {
        neutral: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        primary: 'bg-accent/10 text-accent',
        success: 'bg-green-500/10 text-green-600 dark:text-green-400',
        warning: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    };

    return (
        <span className={twMerge(
            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
