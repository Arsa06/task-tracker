import React from 'react';

export const HomePage = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1 style={{ color: '#2c3e50' }}>Welcome to Lab 4</h1>
        <p style={{ fontSize: '1.2em', color: '#666' }}>
            Advanced State Management with Context API & React Router
        </p>
    </div>
);

import TaskTracker from '../components/TaskTracker';
export const TasksPage = () => (
    <div>
        <TaskTracker />
    </div>
);

export const RecipesPage = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Recipe Book</h2>
        <p>This is a placeholder for the Recipe Book project.</p>
    </div>
);

export const MoviesPage = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Movie Gallery</h2>
        <p>This is a placeholder for the Movie Gallery project.</p>
    </div>
);

export const ProfilePage = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>User Profile</h2>
        <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '300px',
            margin: '20px auto',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ddd', margin: '0 auto 15px' }}></div>
            <h3>Student Name</h3>
            <p>Group: Seven</p>
        </div>
    </div>
);

import { Link } from 'react-router-dom';
export const NotFoundPage = () => (
    <div style={{ textAlign: 'center', padding: '50px', color: '#e74c3c' }}>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <Link to="/" style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px'
        }}>
            Go Back Home
        </Link>
    </div>
);
