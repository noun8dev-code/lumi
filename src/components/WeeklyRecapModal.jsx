import React from 'react';

const WeeklyRecapModal = ({ isOpen, onClose, onConfirm, kid, logs, actions }) => {
    if (!isOpen || !kid) return null;

    // Filter logs for this kid and this week (assuming logs are cleared weekly, or we just take all logs for now since validation clears them)
    // We'll take all logs for the child since the last reset.
    const kidLogs = logs.filter(l => l.childId === kid.id);

    // Calculate Top Flop (Bad)
    const badLogs = kidLogs.filter(l => l.value < 0);
    const badCounts = {};
    badLogs.forEach(l => {
        badCounts[l.actionId] = (badCounts[l.actionId] || 0) + 1;
    });

    let topFlopId = null;
    let maxBadCount = 0;
    for (const [id, count] of Object.entries(badCounts)) {
        if (count > maxBadCount) {
            maxBadCount = count;
            topFlopId = id;
        }
    }
    const topFlopAction = actions.find(a => a.id === topFlopId);


    // Calculate Top Top (Good)
    const goodLogs = kidLogs.filter(l => l.value > 0);
    const goodCounts = {};
    goodLogs.forEach(l => {
        goodCounts[l.actionId] = (goodCounts[l.actionId] || 0) + 1;
    });

    let topTopId = null;
    let maxGoodCount = 0;
    for (const [id, count] of Object.entries(goodCounts)) {
        if (count > maxGoodCount) {
            maxGoodCount = count;
            topTopId = id;
        }
    }
    const topTopAction = actions.find(a => a.id === topTopId);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'center', background: 'white', borderRadius: '24px', padding: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Bilan de la Semaine</h2>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-color)', marginBottom: '2rem' }}>{kid.name}</h3>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    {/* TOP TOP */}
                    <div style={{ flex: 1, padding: '1rem', background: '#e8f5e9', borderRadius: '16px', border: '2px solid #a5d6a7' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2e7d32' }}>TOP ACTION</h4>
                        {topTopAction ? (
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{topTopAction.label}</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{maxGoodCount} fois</div>
                            </div>
                        ) : (
                            <div style={{ fontStyle: 'italic', opacity: 0.6 }}>Aucune action</div>
                        )}
                    </div>

                    {/* TOP FLOP */}
                    <div style={{ flex: 1, padding: '1rem', background: '#ffebee', borderRadius: '16px', border: '2px solid #ef9a9a' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#c62828' }}>TOP FLOP</h4>
                        {topFlopAction ? (
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{topFlopAction.label}</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{maxBadCount} fois</div>
                            </div>
                        ) : (
                            <div style={{ fontStyle: 'italic', opacity: 0.6 }}>Aucune bêtise</div>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Score Final : <span style={{ color: kid.score >= 10 ? '#2e7d32' : (kid.score >= 5 ? '#f57f17' : '#c62828'), fontSize: '1.5rem' }}>{kid.score}</span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#eee',
                            color: '#333',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Nouvelle Semaine (Reset)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WeeklyRecapModal;
