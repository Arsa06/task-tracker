import React from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, 
    Calendar, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    Circle,
    AlertTriangle,
    Tag
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { Card, Badge, Button } from './ui/Base';
import { useTaskContext } from '../context/TaskContext';

const TaskItem = React.memo(({ task, onEdit }) => {
    const { deleteTask, toggleTask } = useTaskContext();
    
    const isUrgent = task.deadline && !task.completed && 
                     (isPast(parseISO(task.deadline)) || 
                      new Date(task.deadline).getTime() - new Date().getTime() < 86400000);

    const priorityColors = {
        High: 'danger',
        Medium: 'warning',
        Low: 'success'
    };

    const categoryColors = {
        Work: 'bg-blue-500',
        Study: 'bg-indigo-500',
        Personal: 'bg-accent',
        Health: 'bg-emerald-500'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={`group relative p-5 hover:shadow-md border-l-4 overflow-hidden ${
                task.completed ? 'opacity-70 grayscale-[0.3]' : ''
            }`} style={{ borderLeftColor: task.completed ? '#9ca3af' : `var(--accent-color, ${task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981'})` }}>
                
                <div className="flex gap-4">
                    {/* Completion Toggle */}
                    <button 
                        onClick={() => toggleTask(task)}
                        role="checkbox"
                        aria-checked={task.completed}
                        aria-label={task.completed ? `Mark ${task.title} as active` : `Mark ${task.title} as completed`}
                        className={`mt-1 transition-colors ${task.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-700 hover:text-gray-400'}`}
                    >
                        {task.completed ? <CheckCircle2 size={24} fill="currentColor" className="text-white" /> : <Circle size={24} />}
                    </button>

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                                <div className={`w-2 h-2 rounded-full ${categoryColors[task.category] || 'bg-gray-400'}`} title={task.category} />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{task.category}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1.5 h-auto text-gray-400 hover:text-accent"
                                    onClick={() => onEdit(task)}
                                    aria-label={`Edit ${task.title}`}
                                >
                                    <Edit2 size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1.5 h-auto text-gray-400 hover:text-red-500"
                                    onClick={() => deleteTask(task.id)}
                                    aria-label={`Delete ${task.title}`}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <h3 className={`text-lg font-bold font-outfit truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                {task.description}
                            </p>
                        )}

                        {/* Footer / Meta */}
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                            {task.deadline && (
                                <div className={`flex items-center gap-1.5 text-xs font-semibold ${isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                                    {isUrgent ? <AlertTriangle size={14} /> : <Clock size={14} />}
                                    <span>
                                        {isPast(parseISO(task.deadline)) ? 'Overdue: ' : 'Due: '}
                                        {format(parseISO(task.deadline), 'MMM d, p')}
                                        <span className="ml-1 opacity-60">({formatDistanceToNow(parseISO(task.deadline), { addSuffix: true })})</span>
                                    </span>
                                </div>
                            )}

                            {task.tags && task.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-gray-400" />
                                    <div className="flex gap-1">
                                        {task.tags.map(tag => (
                                            <span key={tag} className="text-[10px] text-gray-400">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isUrgent && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        Urgent
                    </div>
                )}
            </Card>
        </motion.div>
    );
});

export default TaskItem;
