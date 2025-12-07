import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                background: 'white',
                borderRadius: '24px',
                padding: '2rem',
                width: '90%',
                maxWidth: '320px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                transform: 'scale(1)',
                animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 1.5rem',
                    background: '#ffebee',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef5350',
                    fontSize: '2.5rem',
                    animation: 'shake 0.5s ease-in-out'
                }}>
                    🗑️
                </div>

                <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '1.4rem',
                    color: '#1d1d1f',
                    fontWeight: '700'
                }}>
                    {title || 'Confirmer la suppression'}
                </h3>

                {message && (
                    <p style={{
                        margin: '0 0 2rem 0',
                        color: '#6e6e73',
                        fontSize: '1rem',
                        lineHeight: '1.4'
                    }}>
                        {message}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '14px',
                            border: 'none',
                            background: '#f5f5f7',
                            color: '#1d1d1f',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '14px',
                            border: 'none',
                            background: '#ff3b30',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        Supprimer
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    75% { transform: rotate(10deg); }
                }
            `}</style>
        </div>
    );
};

export default DeleteConfirmModal;
