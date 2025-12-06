import React from 'react';

const ActivityLog = ({ logs, actions, childId, onDelete }) => {
    const childLogs = logs
        .filter(log => log.childId === childId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (childLogs.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#86868b',
                background: 'rgba(255,255,255,0.4)',
                borderRadius: '20px',
                marginTop: '2rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span style={{ fontSize: '2rem' }}>📜</span>
                <p style={{ margin: 0, fontWeight: '500' }}>Aucune activité aujourd'hui</p>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Le journal s'affichera ici</p>
            </div>
        );
    }

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getActionLabel = (actionId) => {
        const action = actions.find(a => a.id === actionId);
        return action ? action.label : 'Action inconnue';
    };

    const getActionValue = (actionId) => {
        const action = actions.find(a => a.id === actionId);
        return action ? action.value : 0;
    };

    const isGoodAction = (actionId) => {
        const action = actions.find(a => a.id === actionId);
        return action?.type === 'good';
    };

    return (
        <div className="activity-log" style={{ marginTop: '2.5rem', width: '100%', position: 'relative' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem',
                gap: '10px'
            }}>
                <div style={{
                    background: 'var(--accent-color)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)'
                }}>
                    📝
                </div>
                <h3 style={{
                    margin: 0,
                    color: '#1d1d1f',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    letterSpacing: '-0.01em'
                }}>
                    Journal de Bord
                </h3>
            </div>

            <div style={{
                position: 'relative',
                paddingLeft: '20px' // Space for the timeline line
            }}>
                {/* Timeline Line */}
                <div style={{
                    position: 'absolute',
                    left: '0px',
                    top: '15px',
                    bottom: '15px',
                    width: '3px',
                    background: 'linear-gradient(to bottom, #dbe4ef 0%, #dbe4ef 100%)',
                    borderRadius: '1.5px',
                    opacity: 0.5
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {childLogs.map((log, index) => {
                        const isGood = isGoodAction(log.actionId);
                        const value = getActionValue(log.actionId);

                        return (
                            <div key={log.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                opacity: 0, // Animation start
                                transform: 'translateY(10px)', // Animation start
                                animation: `fadeInSlide 0.4s ease-out forwards`,
                                animationDelay: `${index * 0.05}s`
                            }}>
                                {/* Timeline Dot */}
                                <div style={{
                                    position: 'absolute',
                                    left: '-25.5px', // Align with line center (20px pad + ~5px offset)
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    background: isGood ? '#34c759' : '#ff3b30',
                                    border: '3px solid #f2f2f7', // Match bg
                                    boxShadow: `0 2px 5px ${isGood ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 59, 48, 0.4)'}`,
                                    zIndex: 2
                                }} />

                                {/* Card */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px',
                                    background: isGood ? 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
                                    border: '1px solid rgba(255,255,255,0.8)',
                                    minHeight: '60px',
                                    transition: 'transform 0.2s',
                                    cursor: 'default'
                                }}>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginRight: '15px',
                                        alignItems: 'center',
                                        minWidth: '45px'
                                    }}>
                                        <span style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            color: '#1d1d1f'
                                        }}>
                                            {formatTime(log.date)}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1, paddingRight: '10px' }}>
                                        <span style={{
                                            fontWeight: '600',
                                            color: '#1d1d1f',
                                            fontSize: '1rem',
                                            display: 'block',
                                            lineHeight: '1.3'
                                        }}>
                                            {getActionLabel(log.actionId)}
                                        </span>
                                    </div>

                                    <div style={{
                                        background: isGood ? '#34c759' : '#ff3b30',
                                        color: 'white',
                                        fontWeight: '800',
                                        fontSize: '0.9rem',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        boxShadow: `0 4px 10px ${isGood ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`,
                                        minWidth: '40px',
                                        textAlign: 'center'
                                    }}>
                                        {value > 0 ? `+${value}` : value}
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onDelete) onDelete(log.id);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            marginLeft: '5px',
                                            opacity: 0.6,
                                            transition: 'opacity 0.2s',
                                            fontSize: '1.2rem'
                                        }}
                                        className="delete-btn"
                                        title="Supprimer cette action"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes fadeInSlide {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ActivityLog;
