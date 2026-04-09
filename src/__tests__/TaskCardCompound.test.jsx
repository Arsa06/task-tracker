import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TaskCardCompound from '../components/TaskCardCompound';
import * as TaskContextModule from '../context/TaskContext';

jest.mock('../context/TaskContext', () => ({
    useTaskContext: jest.fn(),
}));

const mockTask = {
    id: 'task-1',
    title: 'Build tests',
    description: 'Write coverage for compound components.',
    category: 'Work',
    priority: 'High',
    deadline: '2026-04-10T09:00:00.000Z',
    completed: false,
    tags: ['testing', 'react'],
};

describe('TaskCardCompound', () => {
    beforeEach(() => {
        TaskContextModule.useTaskContext.mockReturnValue({
            deleteTask: jest.fn(),
            toggleTask: jest.fn(),
        });
    });

    it('renders the header, body and footer sections', async () => {
        render(
            <MemoryRouter>
                <TaskCardCompound task={mockTask}>
                    <TaskCardCompound.Header />
                    <TaskCardCompound.Body />
                    <TaskCardCompound.Footer />
                </TaskCardCompound>
            </MemoryRouter>
        );

        expect(screen.getByText('Build tests')).toBeInTheDocument();
        expect(await screen.findByText('Write coverage for compound components.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Mark Build tests as completed/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Open edit page for Build tests/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete Build tests/i })).toBeInTheDocument();
    });

    it('opens the delete confirmation modal and calls onDelete after confirmation', async () => {
        const user = userEvent.setup();
        const onDelete = jest.fn();

        render(
            <MemoryRouter>
                <TaskCardCompound task={mockTask} onDelete={onDelete}>
                    <TaskCardCompound.Header />
                    <TaskCardCompound.Body />
                    <TaskCardCompound.Footer />
                </TaskCardCompound>
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: /Delete Build tests/i }));

        expect(await screen.findByText('Delete task?')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Confirm delete/i }));

        await waitFor(() => {
            expect(onDelete).toHaveBeenCalledWith(mockTask);
        });
    });

    it('calls the toggle callback when the complete button is pressed', async () => {
        const user = userEvent.setup();
        const onToggle = jest.fn();

        render(
            <MemoryRouter>
                <TaskCardCompound task={mockTask} onToggle={onToggle}>
                    <TaskCardCompound.Header />
                    <TaskCardCompound.Body />
                    <TaskCardCompound.Footer />
                </TaskCardCompound>
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: /Mark Build tests as completed/i }));

        expect(onToggle).toHaveBeenCalledWith(mockTask);
    });
});
