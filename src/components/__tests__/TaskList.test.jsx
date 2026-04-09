import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from '../TaskList';
import * as TaskContextModule from '../../context/TaskContext';

jest.mock('../../context/TaskContext', () => ({
    useTaskContext: jest.fn()
}));

const mockTasks = [
    { id: 1, title: 'Learn React', category: 'Study', date: '2026-04-01', description: 'React Router', completed: false, tags: ['Important'] },
    { id: 2, title: 'Write Tests', category: 'Work', date: '2026-04-02', description: 'Jest', completed: true, tags: [] }
];

describe('TaskList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TaskContextModule.useTaskContext.mockReturnValue({
            deleteTask: jest.fn(),
            toggleTask: jest.fn()
        });
    });

    it('should render "No tasks found" when tasks array is empty', () => {
        render(<TaskList tasks={[]} onEdit={jest.fn()} />);
        expect(screen.getByText('No tasks found.')).toBeInTheDocument();
    });

    it('should render correct number of TaskItem components', () => {
        render(<TaskList tasks={mockTasks} onEdit={jest.fn()} />);
        
        expect(screen.getByText('Learn React')).toBeInTheDocument();
        expect(screen.getByText('Write Tests')).toBeInTheDocument();
        expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    });

    it('should pass correct editing capabilities', () => {
        const handleEdit = jest.fn();
        render(<TaskList tasks={mockTasks} onEdit={handleEdit} />);
        
        const editButtons = screen.getAllByRole('button', { name: /Edit/i });
        editButtons[0].click();
        
        expect(handleEdit).toHaveBeenCalledTimes(1);
        expect(handleEdit).toHaveBeenCalledWith(mockTasks[0]);
    });
});
