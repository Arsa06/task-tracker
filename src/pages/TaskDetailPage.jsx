import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CircleCheckBig, Clock3, Tag } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Card, Badge, Button } from '../components/ui/Base';
import { useTaskContext } from '../context/TaskContext';

const TaskDetailPage = () => {
    const { taskId } = useParams();
    const { tasks } = useTaskContext();

    const task = tasks.find((item) => String(item.id) === String(taskId));

    if (!task) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">Task not found</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    The task may have been removed or the link is no longer valid.
                </p>
                <Link to="/tasks" className="mt-6 inline-flex">
                    <Button>
                        <ArrowLeft size={16} /> Back to tasks
                    </Button>
                </Link>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link to="/tasks" className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                        <ArrowLeft size={16} /> Back to tasks
                    </Link>
                    <h1 className="mt-3 text-3xl font-bold font-outfit text-gray-900 dark:text-white">{task.title}</h1>
                </div>
                <Link to={`/tasks/${task.id}/edit`}>
                    <Button>Edit Task</Button>
                </Link>
            </div>

            <Card className="p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={task.completed ? 'success' : 'warning'}>
                        {task.completed ? 'Completed' : 'Active'}
                    </Badge>
                    <Badge variant={
                        task.priority === 'High'
                            ? 'danger'
                            : task.priority === 'Medium'
                                ? 'warning'
                                : 'success'
                    }>
                        {task.priority}
                    </Badge>
                    <Badge>{task.category}</Badge>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Description</h2>
                    <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        {task.description || 'No description provided yet.'}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                            <CalendarDays size={16} />
                            Deadline
                        </div>
                        <p className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                            {task.deadline ? format(parseISO(task.deadline), 'PPP p') : 'No deadline'}
                        </p>
                        {task.deadline && (
                            <p className="mt-1 text-xs text-gray-500">
                                {formatDistanceToNow(parseISO(task.deadline), { addSuffix: true })}
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                            <CircleCheckBig size={16} />
                            Status
                        </div>
                        <p className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                            {task.completed ? 'Task is completed' : 'Task is still in progress'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                        <Tag size={16} />
                        Tags
                    </div>
                    {task.tags?.length ? task.tags.map((tag) => (
                        <Badge key={tag} variant="primary">{tag}</Badge>
                    )) : (
                        <span className="text-sm text-gray-500">No tags</span>
                    )}
                </div>

                {task.createdAt && (
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
                        <Clock3 size={14} />
                        Created {format(parseISO(task.createdAt), 'PPP p')}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TaskDetailPage;

