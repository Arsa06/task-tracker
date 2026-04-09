import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
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

export default NotFoundPage;
