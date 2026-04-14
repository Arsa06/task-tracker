const API_URL = 'http://localhost:5000/tasks';
const STORAGE_KEY = 'taskyy-tasks';

const delay = (ms) => new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
});

const readStoredTasks = () => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const storedTasks = window.localStorage.getItem(STORAGE_KEY);
        return storedTasks ? JSON.parse(storedTasks) : [];
    } catch {
        return [];
    }
};

const writeStoredTasks = (tasks) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
        // Ignore storage failures and keep the in-memory response available.
    }
};

const withServerFallback = async (serverAction, fallbackAction) => {
    if (typeof fetch === 'function') {
        try {
            return await serverAction();
        } catch {
            // Fall back to localStorage when the mock API is unavailable.
        }
    }

    return fallbackAction();
};

const normalizeTask = (task) => ({
    completed: false,
    tags: [],
    createdAt: new Date().toISOString(),
    ...task,
});

export const taskService = {
    getTasks: async () => {
        await delay(250);

        return withServerFallback(async () => {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const tasks = await response.json();
            writeStoredTasks(tasks);
            return tasks;
        }, () => readStoredTasks());
    },

    addTask: async (task) => {
        await delay(200);

        const preparedTask = normalizeTask({
            ...task,
            id: task.id ? String(task.id) : String(Date.now()),
        });

        return withServerFallback(async () => {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preparedTask),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const createdTask = await response.json();
            const nextTasks = [...readStoredTasks(), createdTask];
            writeStoredTasks(nextTasks);
            return createdTask;
        }, () => {
            const tasks = readStoredTasks();
            const nextTasks = [...tasks, preparedTask];
            writeStoredTasks(nextTasks);
            return preparedTask;
        });
    },

    updateTask: async (id, updates) => {
        await delay(200);

        return withServerFallback(async () => {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedTask = await response.json();
            const nextTasks = readStoredTasks().map((task) => (
                String(task.id) === String(id) ? updatedTask : task
            ));
            writeStoredTasks(nextTasks);
            return updatedTask;
        }, () => {
            const tasks = readStoredTasks();
            const nextTasks = tasks.map((task) => (
                String(task.id) === String(id)
                    ? { ...task, ...updates }
                    : task
            ));

            writeStoredTasks(nextTasks);
            return nextTasks.find((task) => String(task.id) === String(id)) || null;
        });
    },

    deleteTask: async (id) => {
        await delay(200);

        return withServerFallback(async () => {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const nextTasks = readStoredTasks().filter((task) => String(task.id) !== String(id));
            writeStoredTasks(nextTasks);
            return String(id);
        }, () => {
            const tasks = readStoredTasks();
            const nextTasks = tasks.filter((task) => String(task.id) !== String(id));
            writeStoredTasks(nextTasks);
            return String(id);
        });
    },
};

export { API_URL as TASKS_API_URL, STORAGE_KEY as TASKS_STORAGE_KEY };
