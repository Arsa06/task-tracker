import React from 'react';
import PropTypes from 'prop-types';
import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { AlertTriangle, CalendarDays, CircleCheckBig, Tag } from 'lucide-react';
import { Badge } from '../ui/Base';

const priorityVariant = {
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
};

const TaskCardBodyContent = ({ task }) => {
    const hasDeadline = Boolean(task.deadline);
    const isOverdue = hasDeadline && !task.completed && isPast(parseISO(task.deadline));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant={priorityVariant[task.priority] || 'neutral'}>
                    {task.priority}
                </Badge>
                <Badge variant={task.completed ? 'success' : 'neutral'}>
                    {task.completed ? 'Completed' : 'Active'}
                </Badge>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                    {task.category}
                </span>
            </div>

            <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                {task.description || 'No description provided yet.'}
            </p>

            {hasDeadline && (
                <div className={`flex flex-wrap items-center gap-2 text-sm ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isOverdue ? <AlertTriangle size={16} /> : <CalendarDays size={16} />}
                    <span>
                        {format(parseISO(task.deadline), 'PPP p')}
                    </span>
                    <span className="opacity-70">
                        ({formatDistanceToNow(parseISO(task.deadline), { addSuffix: true })})
                    </span>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                <span className="inline-flex items-center gap-2">
                    <CircleCheckBig size={14} />
                    {task.completed ? 'Task closed' : 'Needs attention'}
                </span>

                {task.tags?.length > 0 && (
                    <span className="inline-flex items-center gap-2">
                        <Tag size={14} />
                        {task.tags.join(', ')}
                    </span>
                )}
            </div>
        </div>
    );
};

TaskCardBodyContent.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string,
        description: PropTypes.string,
        category: PropTypes.string,
        priority: PropTypes.string,
        deadline: PropTypes.string,
        completed: PropTypes.bool,
        tags: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
};

export default TaskCardBodyContent;
