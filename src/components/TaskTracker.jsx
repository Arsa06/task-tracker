import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useModal } from '../hooks/useModal';
import { Button, Card, Badge } from './ui/Base';
import LazyModal from '../lazy/LazyModal';
import LazyTaskCardCompound from '../lazy/LazyTaskCardCompound';
import TaskForm from './TaskForm';
import TaskListWithRenderProps from './TaskListWithRenderProps';
import { 
    Plus, 
    Search, 
    Filter, 
    Calendar as CalendarIcon
} from 'lucide-react';

const TaskTracker = () => {
    const { tasks, loading, error } = useTaskContext();
    const addModal = useModal(false);
    const editModal = useModal(false);

    if (loading && tasks.length === 0) return <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-3xl"></div>)}
        </div>
    </div>;

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-950/30">
                <h2 className="text-xl font-bold font-outfit text-red-600 dark:text-red-400">Unable to load tasks</h2>
                <p className="mt-2 text-sm text-red-500">{error}</p>
            </Card>
        );
    }

    const categories = ['Work', 'Study', 'Personal', 'Health'];
    const priorities = ['High', 'Medium', 'Low'];
    const statuses = ['Active', 'Completed'];

    return (
        <TaskListWithRenderProps tasks={tasks}>
            {({ filteredTasks, filter, sort, setFilter, setSort }) => (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white">Task Tracker</h2>
                            <p className="text-gray-500 dark:text-gray-400">Manage and organize your journey.</p>
                        </div>
                        <Button onClick={() => addModal.open()} size="lg" className="rounded-2xl">
                            <Plus size={20} /> Add New Task
                        </Button>
                    </div>

                    <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-accent" size={18} />
                            <input
                                type="text"
                                placeholder="Search tasks, descriptions, or tags..."
                                value={filter.search}
                                onChange={(event) => setFilter({ search: event.target.value })}
                                aria-label="Search tasks"
                                className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all focus:border-accent/20 dark:bg-gray-900"
                            />
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                            <select
                                className="cursor-pointer rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent dark:bg-gray-900"
                                value={filter.category}
                                onChange={(event) => setFilter({ category: event.target.value })}
                                aria-label="Filter by category"
                            >
                                <option value="All">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select
                                className="cursor-pointer rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent dark:bg-gray-900"
                                value={filter.status}
                                onChange={(event) => setFilter({ status: event.target.value })}
                                aria-label="Filter by status"
                            >
                                <option value="All">All Status</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>

                            <select
                                className="cursor-pointer rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent dark:bg-gray-900"
                                value={filter.priority}
                                onChange={(event) => setFilter({ priority: event.target.value })}
                                aria-label="Filter by priority"
                            >
                                <option value="All">All Priority</option>
                                {priorities.map((priority) => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
                                    Showing {filteredTasks.length} Task(s)
                                </span>
                                <Badge variant="primary">{sort.by === 'priority' ? 'Priority sort' : 'Date sort'}</Badge>
                            </div>
                            <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                                <button
                                    className={`rounded-lg p-2 ${sort.by === 'deadline' ? 'bg-white text-accent shadow-sm dark:bg-dark-card' : 'text-gray-400'}`}
                                    onClick={() => setSort({ by: 'deadline', direction: 'asc' })}
                                    title="Sort by deadline"
                                    aria-label="Sort by deadline"
                                >
                                    <CalendarIcon size={18} />
                                </button>
                                <button
                                    className={`rounded-lg p-2 ${sort.by === 'priority' ? 'bg-white text-accent shadow-sm dark:bg-dark-card' : 'text-gray-400'}`}
                                    onClick={() => setSort({ by: 'priority', direction: 'desc' })}
                                    title="Sort by priority"
                                    aria-label="Sort by priority"
                                >
                                    <Filter size={18} />
                                </button>
                            </div>
                        </div>

                        {filteredTasks.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {filteredTasks.map((task) => (
                                    <LazyTaskCardCompound
                                        key={task.id}
                                        task={task}
                                        onEdit={editModal.open}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center dark:border-gray-800">
                                <h3 className="text-xl font-bold font-outfit text-gray-400">No tasks found.</h3>
                                <p className="mt-1 text-gray-500">Try adjusting your filters or add a new task.</p>
                            </Card>
                        )}
                    </div>

                    <LazyModal
                        isOpen={addModal.isOpen}
                        onClose={addModal.close}
                        title="Create New Task"
                    >
                        <TaskForm onSuccess={addModal.close} />
                    </LazyModal>

                    <LazyModal
                        isOpen={editModal.isOpen}
                        onClose={editModal.close}
                        title="Edit Task"
                    >
                        {editModal.modalData && (
                            <TaskForm
                                initialData={editModal.modalData}
                                buttonText="Update Task"
                                onSuccess={editModal.close}
                            />
                        )}
                    </LazyModal>
                </div>
            )}
        </TaskListWithRenderProps>
    );
};

export default TaskTracker;
