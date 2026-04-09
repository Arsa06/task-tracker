import React from 'react';

const ProfilePage = () => {
    const profiles = [
        {
            name: "Kantpai Arsen",
            group: "IT2-2307",
            avatar: "https://ui-avatars.com/api/?name=Kantpai+Arsen&background=4CAF50&color=fff&size=80"
        },
        {
            name: "Tleumbetov Batyrzhan",
            group: "IT2-2307",
            avatar: "https://ui-avatars.com/api/?name=Tleumbetov+Batyrzhan&background=2196F3&color=fff&size=80"
        }
    ];

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>User Profiles</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                {profiles.map((profile, index) => (
                    <div key={index} style={{
                        backgroundColor: '#fff',
                        padding: '30px',
                        borderRadius: '12px',
                        width: '280px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        cursor: 'default'
                    }}>
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '20px', border: '3px solid #f0f0f0' }}
                        />
                        <h3 style={{ margin: '10px 0', color: '#333' }}>{profile.name}</h3>
                        <p style={{ color: '#666', fontSize: '1.1em', fontWeight: '500' }}>Group: {profile.group}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;
