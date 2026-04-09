import React from 'react';
import PageContent from '../components/PageContent';

const HomePage = () => (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Welcome to Lab 4</h1>
        <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '40px' }}>
            Advanced State Management with Context API & React Router
        </p>

        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Dynamic Dashboard</h2>
            <PageContent />
        </div>
    </div>
);

export default HomePage;
