import React, { useState } from 'react';

const SyncModal = ({ isOpen, onClose, onCreateFamily, onJoinFamily, currentFamilyId }) => {
    const [joinId, setJoinId] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleJoin = async () => {
        if (!joinId.trim()) return;
        const success = await onJoinFamily(joinId.trim().toUpperCase());
        if (success) {
            onClose();
        } else {
            setError("Famille introuvable");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '350px', textAlign: 'center' }}>
                <h3>☁️ Synchronisation</h3>

                {currentFamilyId ? (
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>Vous êtes connecté à la famille :</p>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'var(--accent-color)',
                            letterSpacing: '2px',
                            background: 'var(--card-bg)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '2px dashed var(--border-color)'
                        }}>
                            {currentFamilyId}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                            Partagez ce code avec l'autre parent pour synchroniser les données.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <button
                                onClick={onCreateFamily}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'var(--accent-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Créer une nouvelle famille
                            </button>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                Crée un code unique pour votre famille.
                            </p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Ou rejoindre une famille existante :</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Code Famille"
                                    value={joinId}
                                    onChange={e => setJoinId(e.target.value.toUpperCase())}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-color)',
                                        color: 'var(--text-color)',
                                        textTransform: 'uppercase',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <button
                                    onClick={handleJoin}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Rejoindre
                                </button>
                            </div>
                            {error && <p style={{ color: '#ff3b30', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>}
                        </div>
                    </div>
                )}

                <button
                    className="close-modal"
                    onClick={onClose}
                    style={{ marginTop: '1.5rem' }}
                >
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default SyncModal;
