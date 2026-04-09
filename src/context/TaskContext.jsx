import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    // API endpoint
    const API_URL = 'http://localhost:5000/tasks';
    
    // Fetch data using custom hook
    const { data: tasks, loading, error, refetch } = useFetch(API_URL);

    const addTask = useCallback(async (newTask) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTask,
                    completed: false,
                    tags: newTask.tags || [],
                    createdAt: new Date().toISOString()
                })
            });
            if (response.ok) refetch();
        } catch (err) {
            console.error("Failed to add task", err);
        }
    }, [refetch]);

    const updateTask = useCallback(async (updatedTask) => {
        try {
            const response = await fetch(`${API_URL}/${updatedTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            });
            if (response.ok) refetch();
        } catch (err) {
            console.error("Failed to update task", err);
        }
    }, [refetch]);

    const deleteTask = useCallback(async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) refetch();
        } catch (err) {
            console.error("Failed to delete task", err);
        }
    }, [refetch]);

    const toggleTask = useCallback(async (task) => {
        try {
            const response = await fetch(`${API_URL}/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...task, completed: !task.completed })
            });
            if (response.ok) refetch();
        } catch (err) {
            console.error("Failed to toggle task", err);
        }
    }, [refetch]);

    const contextValue = useMemo(() => ({
        tasks: tasks || [],
        loading,
        error,
        addTask,
        deleteTask,
        toggleTask,
        updateTask
    }), [tasks, loading, error, addTask, deleteTask, toggleTask, updateTask]);

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    );
};
