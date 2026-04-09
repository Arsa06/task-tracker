import React, {
    Suspense,
    createContext,
    lazy,
    memo,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Edit3, ExternalLink, Trash2 } from 'lucide-react';
import { Card, Button } from '../ui/Base';
import { useTaskContext } from '../../context/TaskContext';
import LazyModal from '../../lazy/LazyModal';

const TaskCardBodyContent = lazy(() => import('./TaskCardBodyContent'));

const TaskCardCompoundContext = createContext(null);

const useTaskCardCompound = () => {
    const context = useContext(TaskCardCompoundContext);

    if (!context) {
        throw new Error('TaskCardCompound subcomponents must be used within TaskCardCompound');
    }

    return context;
};

const taskShape = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    priority: PropTypes.string,
    deadline: PropTypes.string,
    completed: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string,
});

const DefaultDeleteDialog = ({ closeDeleteDialog, confirmDelete, taskTitle }) => (
    <div className="space-y-4">
        <div>
            <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Delete task?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                You are about to remove <span className="font-semibold text-gray-900 dark:text-white">{taskTitle}</span>.
                This action cannot be undone.
            </p>
        </div>
        <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeDeleteDialog}>
                Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
                Confirm delete
            </Button>
        </div>
    </div>
);

DefaultDeleteDialog.propTypes = {
    closeDeleteDialog: PropTypes.func.isRequired,
    confirmDelete: PropTypes.func.isRequired,
    taskTitle: PropTypes.string,
};

const TaskCardCompoundBase = ({
    task,
    children,
    onDelete,
    onEdit,
    onToggle,
}) => {
    const { deleteTask, toggleTask } = useTaskContext();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const openDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(true);
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (onDelete) {
            await onDelete(task);
        } else {
            await deleteTask(task.id);
        }

        closeDeleteDialog();
    }, [closeDeleteDialog, deleteTask, onDelete, task]);

    const handleToggle = useCallback(async () => {
        if (onToggle) {
            await onToggle(task);
            return;
        }

        await toggleTask(task);
    }, [onToggle, task, toggleTask]);

    const handleEdit = useCallback(() => {
        if (onEdit) {
            onEdit(task);
        }
    }, [onEdit, task]);

    const value = useMemo(() => ({
        task,
        isDeleteDialogOpen,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
        handleToggle,
        handleEdit,
        hasInlineEdit: Boolean(onEdit),
    }), [
        closeDeleteDialog,
        confirmDelete,
        handleEdit,
        handleToggle,
        isDeleteDialogOpen,
        onEdit,
        openDeleteDialog,
        task,
    ]);

    return (
        <TaskCardCompoundContext.Provider value={value}>
            <Card className={`relative h-full space-y-5 border-l-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                task.completed ? 'border-l-green-500/70 bg-gray-50/70 dark:bg-gray-950/40' : 'border-l-accent'
            }`}>
                {children || (
                    <>
                        <TaskCardCompound.Header />
                        <TaskCardCompound.Body />
                        <TaskCardCompound.Footer />
                    </>
                )}
            </Card>

            <LazyModal
                isOpen={isDeleteDialogOpen}
                onClose={closeDeleteDialog}
                title="Delete task"
            >
                <DefaultDeleteDialog
                    closeDeleteDialog={closeDeleteDialog}
                    confirmDelete={confirmDelete}
                    taskTitle={task.title}
                />
            </LazyModal>
        </TaskCardCompoundContext.Provider>
    );
};

TaskCardCompoundBase.propTypes = {
    task: taskShape.isRequired,
    children: PropTypes.node,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onToggle: PropTypes.func,
};

const Header = () => {
    const { task } = useTaskCardCompound();

    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
                <Link
                    to={`/tasks/${task.id}`}
                    className="group inline-flex items-center gap-2 text-left"
                >
                    <h3 className={`text-xl font-bold font-outfit transition-colors ${
                        task.completed
                            ? 'text-gray-400 line-through'
                            : 'text-gray-900 group-hover:text-accent dark:text-white'
                    }`}>
                        {task.title}
                    </h3>
                    <ExternalLink size={16} className="text-gray-400 transition group-hover:text-accent" />
                </Link>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                    task.completed
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-accent/10 text-accent'
                }`}>
                    {task.completed ? 'Done' : 'Open'}
                </span>
            </div>
        </div>
    );
};

const Body = () => {
    const { task } = useTaskCardCompound();

    return (
        <Suspense
            fallback={(
                <div className="space-y-3 animate-pulse">
                    <div className="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-2/3 rounded-full bg-gray-200 dark:bg-gray-800" />
                </div>
            )}
        >
            <TaskCardBodyContent task={task} />
        </Suspense>
    );
};

const Footer = () => {
    const {
        task,
        openDeleteDialog,
        handleToggle,
        handleEdit,
        hasInlineEdit,
    } = useTaskCardCompound();

    return (
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <Button
                type="button"
                variant={task.completed ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleToggle}
                aria-label={task.completed ? `Mark ${task.title} as active` : `Mark ${task.title} as completed`}
            >
                {task.completed ? <Circle size={16} /> : <CheckCircle2 size={16} />}
                {task.completed ? 'Mark Active' : 'Mark Done'}
            </Button>

            {hasInlineEdit ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    aria-label={`Edit ${task.title}`}
                >
                    <Edit3 size={16} />
                    Edit
                </Button>
            ) : (
                <Link to={`/tasks/${task.id}/edit`}>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Open edit page for ${task.title}`}
                    >
                        <Edit3 size={16} />
                        Edit
                    </Button>
                </Link>
            )}

            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                onClick={openDeleteDialog}
                aria-label={`Delete ${task.title}`}
            >
                <Trash2 size={16} />
                Delete
            </Button>
        </div>
    );
};

const TaskCardCompound = memo(TaskCardCompoundBase);

TaskCardCompound.Header = Header;
TaskCardCompound.Body = Body;
TaskCardCompound.Footer = Footer;

export default TaskCardCompound;
