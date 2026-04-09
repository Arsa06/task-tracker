import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, Button } from '../components/ui/Base';
import TaskForm from '../components/TaskForm';
import { useTaskContext } from '../context/TaskContext';

const TaskEditPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { tasks } = useTaskContext();

    const task = tasks.find((item) => String(item.id) === String(taskId));

    if (!task) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">Task not found</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    There is nothing to edit because this task could not be found.
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
            <div>
                <Link to={`/tasks/${task.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                    <ArrowLeft size={16} /> Back to details
                </Link>
                <h1 className="mt-3 text-3xl font-bold font-outfit text-gray-900 dark:text-white">Edit Task</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Update the task details and save your changes.
                </p>
            </div>

            <Card className="p-6">
                <TaskForm
                    initialData={task}
                    buttonText="Save Changes"
                    onSuccess={() => navigate(`/tasks/${task.id}`)}
                />
            </Card>
        </div>
    );
};

export default TaskEditPage;

