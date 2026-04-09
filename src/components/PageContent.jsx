import React from 'react';
import { useTaskContext } from '../context/TaskContext';

const PageContent = () => {
    const { tasks } = useTaskContext();

    if (tasks.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <p>No tasks available to display in PageContent.</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
            padding: '20px 0'
        }}>
            {tasks.map(task => (
                <div key={task.id} style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderLeft: `5px solid ${task.completed ? '#4CAF50' : '#FF9800'}`,
                    transition: 'all 0.2s'
                }}>
                    <h3 style={{
                        margin: '0 0 10px 0',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? '#888' : '#333'
                    }}>
                        {task.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9em' }}>
                        <span style={{
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            padding: '3px 8px',
                            borderRadius: '12px'
                        }}>
                            {task.category}
                        </span>
                        <span style={{ color: '#999' }}>{task.date}</span>
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <span style={{
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                            color: task.completed ? '#4CAF50' : '#FF9800'
                        }}>
                            {task.completed ? 'COMPLETE' : 'IN PROGRESS'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PageContent;
