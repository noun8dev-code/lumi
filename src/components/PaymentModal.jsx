import React from 'react';

const PaymentModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Information Tarifaire</h3>

                <div style={{ textAlign: 'left', marginBottom: '2rem', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        Veuillez noter que notre tarif inclut un enfant.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        À partir du 2ᵉ enfant, un abonnement est appliqué.
                    </p>
                    <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                        Cet abonnement est de 3 $ par mois.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Cette mesure nous permet d’assurer un service de qualité.
                    </p>
                    <p>
                        Nous vous remercions pour votre compréhension.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={onConfirm}
                        className="action-btn"
                        style={{
                            background: '#007AFF',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Payer 3$ / mois
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#86868b',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
