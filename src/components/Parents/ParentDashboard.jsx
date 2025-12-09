import React from 'react';
import { useNavigate } from 'react-router-dom';

// New "Lumi Papa/Maman" Dashboard
const ParentDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-simple animate-fade-in" style={{ paddingBottom: '120px' }}>
            <div className="ios-header">
                <div className="header-actions">
                    <button className="icon-btn" onClick={() => navigate('/')}>
                        🏡
                    </button>
                </div>
                <div className="title-section">
                    <h1>Espace Parents</h1>
                    <p>Lumi pour Papa et Maman</p>
                </div>
            </div>

            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '24px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px var(--shadow-color)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
                <p style={{ color: 'var(--subtext-color)', fontSize: '1.2rem' }}>
                    Bienvenue dans votre espace de gestion.
                </p>
                {/* Future settings and controls go here */}
            </div>
        </div>
    );
};

export default ParentDashboard;
