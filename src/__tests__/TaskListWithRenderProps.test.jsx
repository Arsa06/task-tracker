import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskListWithRenderProps from '../components/TaskListWithRenderProps';

const mockTasks = [
    {
        id: '1',
        title: 'Write docs',
        description: 'Document the API contract',
        category: 'Work',
        priority: 'Medium',
        completed: false,
        tags: ['docs'],
        deadline: '2026-04-05T10:00:00.000Z',
    },
    {
        id: '2',
        title: 'Archive reports',
        description: 'Prepare archive bundle',
        category: 'Work',
        priority: 'Low',
        completed: true,
        tags: ['archive'],
        deadline: '2026-04-08T10:00:00.000Z',
    },
    {
        id: '3',
        title: 'Build dashboard',
        description: 'Ship the analytics layout',
        category: 'Work',
        priority: 'High',
        completed: false,
        tags: ['frontend'],
        deadline: '2026-04-03T10:00:00.000Z',
    },
];

describe('TaskListWithRenderProps', () => {
    it('calls the render prop with filtered tasks and state handlers', () => {
        const renderSpy = jest.fn(({ filteredTasks, setFilter, setSort }) => (
            <div>
                <span data-testid="task-count">{filteredTasks.length}</span>
                <button type="button" onClick={() => setFilter({ status: 'Completed' })}>
                    Completed only
                </button>
                <button type="button" onClick={() => setSort({ by: 'title', direction: 'asc' })}>
                    Sort title
                </button>
            </div>
        ));

        render(
            <TaskListWithRenderProps tasks={mockTasks} render={renderSpy} />
        );

        expect(renderSpy).toHaveBeenCalled();
        expect(renderSpy.mock.calls[0][0]).toEqual(expect.objectContaining({
            filteredTasks: expect.arrayContaining([
                expect.objectContaining({ id: '1' }),
                expect.objectContaining({ id: '2' }),
                expect.objectContaining({ id: '3' }),
            ]),
            setFilter: expect.any(Function),
            setSort: expect.any(Function),
        }));
        expect(screen.getByTestId('task-count')).toHaveTextContent('3');
    });

    it('updates the rendered UI when the child function changes the filter', async () => {
        const user = userEvent.setup();

        render(
            <TaskListWithRenderProps tasks={mockTasks}>
                {({ filteredTasks, setFilter }) => (
                    <div>
                        <button type="button" onClick={() => setFilter({ status: 'Completed' })}>
                            Show completed
                        </button>
                        {filteredTasks.map((task) => (
                            <p key={task.id}>{task.title}</p>
                        ))}
                    </div>
                )}
            </TaskListWithRenderProps>
        );

        expect(screen.getByText('Write docs')).toBeInTheDocument();
        expect(screen.getByText('Archive reports')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Show completed/i }));

        expect(screen.queryByText('Write docs')).not.toBeInTheDocument();
        expect(screen.queryByText('Build dashboard')).not.toBeInTheDocument();
        expect(screen.getByText('Archive reports')).toBeInTheDocument();
    });

    it('updates the rendered order when the child function changes the sort mode', async () => {
        const user = userEvent.setup();

        render(
            <TaskListWithRenderProps tasks={mockTasks}>
                {({ filteredTasks, setSort }) => (
                    <div>
                        <button type="button" onClick={() => setSort({ by: 'title', direction: 'asc' })}>
                            Sort by title
                        </button>
                        {filteredTasks.map((task) => (
                            <p key={task.id} data-testid="task-title">{task.title}</p>
                        ))}
                    </div>
                )}
            </TaskListWithRenderProps>
        );

        await user.click(screen.getByRole('button', { name: /Sort by title/i }));

        const orderedTitles = screen.getAllByTestId('task-title').map((element) => element.textContent);
        expect(orderedTitles).toEqual(['Archive reports', 'Build dashboard', 'Write docs']);
    });
});
