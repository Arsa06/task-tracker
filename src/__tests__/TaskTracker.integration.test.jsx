import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TaskTracker from '../components/TaskTracker';
import { AuthProvider } from '../context/AuthContext';
import { TaskProvider } from '../context/TaskContext';
import { ThemeProvider } from '../context/ThemeContext';

const API_URL = 'http://localhost:5000/tasks';

const initialTasks = [
    {
        id: '1',
        title: 'Design Taskyy Logo',
        description: 'Create a modern, friendly logo concept for the overhaul.',
        category: 'Work',
        priority: 'High',
        deadline: '2026-04-01T10:00:00.000Z',
        tags: ['Design', 'Branding'],
        completed: false,
    },
    {
        id: '2',
        title: 'Study for Exam',
        description: 'Complete Chapter 5 of React documentation.',
        category: 'Study',
        priority: 'Low',
        deadline: '2026-04-02T10:00:00.000Z',
        tags: ['Urgent'],
        completed: true,
    },
    {
        id: '3',
        title: 'Build dashboard UI',
        description: 'Build the main stats and progress overview.',
        category: 'Work',
        priority: 'Medium',
        deadline: '2026-04-03T18:00:00.000Z',
        tags: ['Frontend'],
        completed: false,
    },
];

let mockTasks = [];
let requestLog = [];

const renderTaskTracker = () => render(
    <MemoryRouter>
        <AuthProvider>
            <ThemeProvider>
                <TaskProvider>
                    <TaskTracker />
                </TaskProvider>
            </ThemeProvider>
        </AuthProvider>
    </MemoryRouter>
);

describe('TaskTracker integration', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        mockTasks = initialTasks.map((task) => ({ ...task }));
        requestLog = [];

        global.fetch = jest.fn(async (input, init = {}) => {
            const url = typeof input === 'string' ? input : input.url;
            const method = (init.method || 'GET').toUpperCase();
            const taskId = url.split('/').pop();

            if (url === API_URL && method === 'GET') {
                return {
                    ok: true,
                    status: 200,
                    json: async () => mockTasks,
                };
            }

            if (url === API_URL && method === 'POST') {
                const body = JSON.parse(init.body);
                requestLog.push({ method: 'POST', body });

                const newTask = {
                    ...body,
                    id: String(mockTasks.length + 1),
                };

                mockTasks = [...mockTasks, newTask];

                return {
                    ok: true,
                    status: 201,
                    json: async () => newTask,
                };
            }

            if (url.startsWith(`${API_URL}/`) && method === 'PUT') {
                const body = JSON.parse(init.body);
                requestLog.push({ method: 'PUT', taskId, body });

                mockTasks = mockTasks.map((task) => (
                    String(task.id) === String(taskId)
                        ? { ...task, ...body }
                        : task
                ));

                const updatedTask = mockTasks.find((task) => String(task.id) === String(taskId));

                return {
                    ok: true,
                    status: 200,
                    json: async () => updatedTask,
                };
            }

            if (url.startsWith(`${API_URL}/`) && method === 'DELETE') {
                requestLog.push({ method: 'DELETE', taskId });
                mockTasks = mockTasks.filter((task) => String(task.id) !== String(taskId));

                return {
                    ok: true,
                    status: 204,
                    json: async () => ({}),
                };
            }

            return {
                ok: false,
                status: 404,
                json: async () => ({}),
            };
        });
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('loads tasks, supports add/edit/delete, filtering, sorting and modal interactions', async () => {
        const user = userEvent.setup();

        renderTaskTracker();

        expect(await screen.findByText('Design Taskyy Logo')).toBeInTheDocument();
        expect(screen.getByText('Study for Exam')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Add New Task/i }));
        expect(await screen.findByText('Create New Task')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /Cancel/i }));
        await waitFor(() => {
            expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /Add New Task/i }));
        const addForm = await screen.findByTestId('hybrid-task-form');
        const addFormQueries = within(addForm);

        await user.type(addFormQueries.getByLabelText(/Title/i), 'Write regression tests');
        await user.type(addFormQueries.getByLabelText(/Description/i), 'Cover add, edit and delete flows.');
        await user.selectOptions(addFormQueries.getByLabelText(/Category/i), 'Study');
        await user.selectOptions(addFormQueries.getByLabelText(/Priority/i), 'Low');
        await user.click(addFormQueries.getByRole('button', { name: /^Add Task$/i }));

        await waitFor(() => {
            expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
        });
        expect(await screen.findByText('Write regression tests')).toBeInTheDocument();
        expect(requestLog).toEqual(expect.arrayContaining([
            expect.objectContaining({
                method: 'POST',
                body: expect.objectContaining({
                    title: 'Write regression tests',
                    description: 'Cover add, edit and delete flows.',
                }),
            }),
        ]));

        await user.click(screen.getByRole('button', { name: /Edit Design Taskyy Logo/i }));
        expect(await screen.findByText('Edit Task')).toBeInTheDocument();

        const editForm = await screen.findByTestId('hybrid-task-form');
        const editTitleInput = within(editForm).getByLabelText(/Title/i);
        await user.clear(editTitleInput);
        await user.type(editTitleInput, 'Design Taskyy Logo Updated');
        await user.click(within(editForm).getByRole('button', { name: /Update Task/i }));

        await waitFor(() => {
            expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
        });
        expect(await screen.findByText('Design Taskyy Logo Updated')).toBeInTheDocument();
        expect(requestLog).toEqual(expect.arrayContaining([
            expect.objectContaining({
                method: 'PUT',
                taskId: '1',
                body: expect.objectContaining({
                    title: 'Design Taskyy Logo Updated',
                }),
            }),
        ]));

        await user.selectOptions(screen.getByLabelText(/Filter by status/i), 'Completed');
        expect(await screen.findByText('Study for Exam')).toBeInTheDocument();
        expect(screen.queryByText('Build dashboard UI')).not.toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText(/Filter by status/i), 'All');
        await user.click(screen.getByRole('button', { name: /Sort by priority/i }));

        await waitFor(() => {
            const orderedTitles = screen.getAllByRole('heading', { level: 3 }).map((element) => element.textContent);
            expect(orderedTitles[0]).toBe('Design Taskyy Logo Updated');
        });

        await user.click(screen.getByRole('button', { name: /Delete Design Taskyy Logo Updated/i }));
        expect(await screen.findByText('Delete task?')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /^Cancel$/i }));
        await waitFor(() => {
            expect(screen.queryByText('Delete task?')).not.toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /Delete Design Taskyy Logo Updated/i }));
        await user.click(await screen.findByRole('button', { name: /Confirm delete/i }));

        await waitFor(() => {
            expect(screen.queryByText('Design Taskyy Logo Updated')).not.toBeInTheDocument();
        });
        expect(requestLog).toEqual(expect.arrayContaining([
            expect.objectContaining({
                method: 'DELETE',
                taskId: '1',
            }),
        ]));
    });
});
