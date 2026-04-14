import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useFetch } from '../hooks/useFetch';
import { NotificationContext } from './NotificationContext';
import { taskService } from '../services/taskService';

const TaskContext = createContext(null);

export const useTaskContext = () => {
    const context = useContext(TaskContext);

    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }

    return context;
};

export const TaskProvider = ({ children, service = taskService }) => {
    const notificationApi = useContext(NotificationContext);
    const fetchTasks = useCallback(() => service.getTasks(), [service]);
    const {
        data: tasks = [],
        setData,
        loading,
        error: fetchError,
        refetch,
    } = useFetch(fetchTasks, { initialData: [] });
    const [mutationError, setMutationError] = useState(null);
    const [isMutating, setIsMutating] = useState(false);
    const [celebration, setCelebration] = useState(null);

    const notify = notificationApi?.notify;
    const error = mutationError || fetchError;

    const handleFailure = useCallback((fallbackMessage, err) => {
        const message = err instanceof Error ? err.message : fallbackMessage;
        setMutationError(message);
        if (notify) {
            notify(`Error: ${fallbackMessage}`, { variant: 'error' });
        }
    }, [notify]);

    const addTask = useCallback(async (newTask) => {
        setIsMutating(true);
        setMutationError(null);

        try {
            const createdTask = await service.addTask({
                ...newTask,
                completed: false,
                tags: newTask.tags || [],
                createdAt: new Date().toISOString(),
            });

            setData((currentTasks) => [...(currentTasks || []), createdTask]);
            if (notify) {
                notify('Task added successfully!', { variant: 'success' });
            }

            return createdTask;
        } catch (err) {
            handleFailure('Please fill all required fields', err);
            return null;
        } finally {
            setIsMutating(false);
        }
    }, [handleFailure, notify, service, setData]);

    const updateTask = useCallback(async (updatedTask) => {
        setIsMutating(true);
        setMutationError(null);

        try {
            const savedTask = await service.updateTask(updatedTask.id, updatedTask);

            setData((currentTasks) => (currentTasks || []).map((task) => (
                String(task.id) === String(updatedTask.id) ? savedTask : task
            )));
            if (notify) {
                notify('Task updated successfully!', { variant: 'success' });
            }

            return savedTask;
        } catch (err) {
            handleFailure('Unable to update the task', err);
            return null;
        } finally {
            setIsMutating(false);
        }
    }, [handleFailure, notify, service, setData]);

    const deleteTask = useCallback(async (id) => {
        setIsMutating(true);
        setMutationError(null);

        try {
            await service.deleteTask(id);
            setData((currentTasks) => (currentTasks || []).filter((task) => String(task.id) !== String(id)));
            if (notify) {
                notify('Task deleted!', { variant: 'info' });
            }
        } catch (err) {
            handleFailure('Unable to delete the task', err);
        } finally {
            setIsMutating(false);
        }
    }, [handleFailure, notify, service, setData]);

    const dismissCelebration = useCallback(() => {
        setCelebration(null);
    }, []);

    const toggleTask = useCallback(async (task) => {
        setIsMutating(true);
        setMutationError(null);

        try {
            const updatedTask = await service.updateTask(task.id, { ...task, completed: !task.completed });
            setData((currentTasks) => (currentTasks || []).map((currentTask) => (
                String(currentTask.id) === String(task.id) ? updatedTask : currentTask
            )));

            if (notify) {
                notify(
                    updatedTask.completed ? 'Marked as complete!' : 'Task marked as active.',
                    { variant: updatedTask.completed ? 'success' : 'info' },
                );
            }

            if (!task.completed && updatedTask.completed) {
                setCelebration({
                    id: Date.now(),
                    taskTitle: updatedTask.title,
                });
            }

            return updatedTask;
        } catch (err) {
            handleFailure('Unable to update the task status', err);
            return null;
        } finally {
            setIsMutating(false);
        }
    }, [handleFailure, notify, service, setData]);

    const contextValue = useMemo(() => ({
        tasks,
        loading,
        error,
        isMutating,
        celebration,
        refetch,
        addTask,
        deleteTask,
        dismissCelebration,
        toggleTask,
        updateTask,
    }), [
        tasks,
        loading,
        error,
        isMutating,
        celebration,
        refetch,
        addTask,
        deleteTask,
        dismissCelebration,
        toggleTask,
        updateTask,
    ]);

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    );
};

TaskProvider.propTypes = {
    children: PropTypes.node.isRequired,
    service: PropTypes.shape({
        getTasks: PropTypes.func,
        addTask: PropTypes.func,
        updateTask: PropTypes.func,
        deleteTask: PropTypes.func,
    }),
};
