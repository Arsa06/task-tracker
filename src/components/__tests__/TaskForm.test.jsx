import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../TaskForm';
import * as TaskContextModule from '../../context/TaskContext';

jest.mock('../../context/TaskContext', () => ({
    useTaskContext: jest.fn()
}));

describe('TaskForm Component', () => {
    const mockAddTask = jest.fn();
    const mockUpdateTask = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        TaskContextModule.useTaskContext.mockReturnValue({
            addTask: mockAddTask,
            updateTask: mockUpdateTask
        });
    });

    it('should render the form with default values', () => {
        render(<TaskForm />);
        
        expect(screen.getByPlaceholderText('Task title...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter task description...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
    });

    it('should show validation error when title is empty', async () => {
        const user = userEvent.setup();

        render(<TaskForm />);

        await user.click(screen.getByRole('button', { name: /Add Task/i }));

        expect(await screen.findByText('Title is required.')).toBeInTheDocument();
        expect(mockAddTask).not.toHaveBeenCalled();
    });

    it('should show how many characters are missing when title is too short', async () => {
        const user = userEvent.setup();

        render(<TaskForm />);

        await user.type(screen.getByPlaceholderText('Task title...'), 'Go');

        expect(
            screen.getByText('Title should contain at least 3 characters. 1 more character needed.')
        ).toBeInTheDocument();
        expect(mockAddTask).not.toHaveBeenCalled();
    });

    it('should prevent selecting a deadline in the past', async () => {
        const user = userEvent.setup();

        render(<TaskForm />);

        await user.type(screen.getByPlaceholderText('Task title...'), 'Valid Task');
        await user.type(screen.getByLabelText('Deadline'), '2000-01-01T10:00');
        await user.click(screen.getByRole('button', { name: /Add Task/i }));

        expect(await screen.findByText('Deadline cannot be in the past.')).toBeInTheDocument();
        expect(mockAddTask).not.toHaveBeenCalled();
    });

    it('should call addTask on successful submit', async () => {
        const user = userEvent.setup();

        render(<TaskForm />);

        await user.type(screen.getByPlaceholderText('Task title...'), 'Valid Task');
        await user.type(screen.getByPlaceholderText('Enter task description...'), 'Useful details for the task.');
        await user.click(screen.getByRole('button', { name: /Add Task/i }));

        await waitFor(() => {
            expect(mockAddTask).toHaveBeenCalledTimes(1);
            expect(mockAddTask).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Valid Task',
                description: 'Useful details for the task.'
            }));
        });
    });
});
