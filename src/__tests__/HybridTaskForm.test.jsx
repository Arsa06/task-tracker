import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HybridTaskForm from '../forms/HybridTaskForm';
import * as TaskContextModule from '../context/TaskContext';

jest.mock('../context/TaskContext', () => ({
    useTaskContext: jest.fn(),
}));

const createFutureDate = (daysAhead, hours, minutes) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hours, minutes, 0, 0);

    return date;
};

const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

describe('HybridTaskForm', () => {
    const mockAddTask = jest.fn();
    const mockUpdateTask = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        TaskContextModule.useTaskContext.mockReturnValue({
            addTask: mockAddTask,
            updateTask: mockUpdateTask,
        });
    });

    it('shows a validation error when the title is empty', async () => {
        const user = userEvent.setup();

        render(<HybridTaskForm />);

        await user.click(screen.getByRole('button', { name: /^Add Task$/i }));

        expect(await screen.findByText('Title is required.')).toBeInTheDocument();
        expect(mockAddTask).not.toHaveBeenCalled();
    });

    it('submits both controlled and uncontrolled fields together', async () => {
        const user = userEvent.setup();
        const futureDeadline = createFutureDate(2, 10, 30);
        const deadlineValue = formatDateForInput(futureDeadline);

        render(<HybridTaskForm />);

        await user.type(screen.getByLabelText(/Title/i), 'Ship Task Tracker tests');
        await user.type(screen.getByLabelText(/Description/i), 'Cover the happy path and edge cases.');
        await user.selectOptions(screen.getByLabelText(/Category/i), 'Study');
        await user.selectOptions(screen.getByLabelText(/Priority/i), 'High');
        await user.type(screen.getByLabelText(/Deadline/i), deadlineValue);

        const expectedDeadline = futureDeadline.toISOString();

        await user.click(screen.getByRole('button', { name: /^Add Task$/i }));

        await waitFor(() => {
            expect(mockAddTask).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Ship Task Tracker tests',
                description: 'Cover the happy path and edge cases.',
                category: 'Study',
                priority: 'High',
                deadline: expectedDeadline,
                tags: [],
            }));
        });
    });

    it('creates a task when the form is prefilled with a calendar deadline but has no id', async () => {
        const user = userEvent.setup();
        const expectedDeadline = createFutureDate(2, 9, 0).toISOString();

        render(
            <HybridTaskForm
                initialData={{
                    deadline: expectedDeadline,
                }}
            />
        );

        await user.type(screen.getByLabelText(/Title/i), 'Calendar quick add');
        await user.type(screen.getByLabelText(/Description/i), 'Created from the selected calendar date.');
        await user.click(screen.getByRole('button', { name: /^Add Task$/i }));

        await waitFor(() => {
            expect(mockAddTask).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Calendar quick add',
                description: 'Created from the selected calendar date.',
                deadline: expectedDeadline,
            }));
        });

        expect(mockUpdateTask).not.toHaveBeenCalled();
    });

    it('prefills edit data and resets fields back to the initial values', async () => {
        const user = userEvent.setup();
        const editDeadline = createFutureDate(3, 9, 0).toISOString();

        render(
            <HybridTaskForm
                initialData={{
                    id: 'task-7',
                    title: 'Existing task',
                    description: 'Persist this note.',
                    category: 'Work',
                    priority: 'Medium',
                    deadline: editDeadline,
                    tags: ['existing'],
                }}
                buttonText="Save Changes"
            />
        );

        const titleInput = screen.getByLabelText(/Title/i);
        const descriptionInput = screen.getByLabelText(/Description/i);

        expect(titleInput).toHaveValue('Existing task');
        expect(descriptionInput).toHaveValue('Persist this note.');

        await user.clear(titleInput);
        await user.type(titleInput, 'Updated title');
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'Updated note for editing.');

        await user.click(screen.getByRole('button', { name: /Reset/i }));

        expect(titleInput).toHaveValue('Existing task');
        expect(descriptionInput).toHaveValue('Persist this note.');
    });

    it('updates an existing task in edit mode', async () => {
        const user = userEvent.setup();
        const editDeadline = createFutureDate(4, 9, 0).toISOString();

        render(
            <HybridTaskForm
                initialData={{
                    id: 'task-7',
                    title: 'Existing task',
                    description: 'Persist this note.',
                    category: 'Work',
                    priority: 'Medium',
                    deadline: editDeadline,
                    tags: ['existing'],
                    completed: false,
                }}
                buttonText="Save Changes"
            />
        );

        const titleInput = screen.getByLabelText(/Title/i);
        await user.clear(titleInput);
        await user.type(titleInput, 'Existing task updated');

        await user.click(screen.getByRole('button', { name: /Save Changes/i }));

        await waitFor(() => {
            expect(mockUpdateTask).toHaveBeenCalledWith(expect.objectContaining({
                id: 'task-7',
                title: 'Existing task updated',
            }));
        });
    });
});
