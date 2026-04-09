import React from 'react';
import { NavLink } from 'react-router-dom';

function NavBar() {
    const linkStyle = ({ isActive }) => ({
        padding: '10px 15px',
        textDecoration: 'none',
        color: isActive ? '#fff' : '#333',
        backgroundColor: isActive ? '#4CAF50' : 'transparent',
        borderRadius: '5px',
        fontWeight: '500',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    });

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            padding: '20px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            marginBottom: '30px',
            flexWrap: 'wrap' // For mobile responsiveness
        }}>
            <NavLink to="/" style={linkStyle}>
                Home
            </NavLink>
            <NavLink to="/tasks" style={linkStyle}>
                Task Tracker
            </NavLink>
            <NavLink to="/profile" style={linkStyle}>
                Profile
            </NavLink>
        </nav>
    );
}

export default NavBar;
