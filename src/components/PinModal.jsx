import React, { useState, useEffect } from 'react';

const PinModal = ({ isOpen, onClose, onSuccess, title, correctPin, setMode = false, closeOnSuccess = true }) => {
    const [inputPin, setInputPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInputPin('');
            setError('');
        }
    }, [isOpen]);

    const handleNumberClick = (num) => {
        if (inputPin.length < 4) {
            const newPin = inputPin + num;
            setInputPin(newPin);

            if (newPin.length === 4) {
                // Auto submit when 4 digits entered
                if (setMode) {
                    onSuccess(newPin);
                    if (closeOnSuccess) onClose();
                } else {
                    if (newPin === correctPin) {
                        onSuccess();
                        if (closeOnSuccess) onClose();
                    } else {
                        setError('Code incorrect');
                        setTimeout(() => {
                            setInputPin('');
                            setError('');
                        }, 1000);
                    }
                }
            }
        }
    };

    const handleClear = () => {
        setInputPin('');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '320px', textAlign: 'center' }}>
                <h3>{title || 'Entrez le code PIN'}</h3>

                <div style={{
                    fontSize: '2rem',
                    letterSpacing: '10px',
                    marginBottom: '2rem',
                    height: '40px',
                    color: 'var(--text-color)'
                }}>
                    {inputPin.split('').map(() => '•').join('')}
                    {[...Array(4 - inputPin.length)].map((_, i) => <span key={i} style={{ opacity: 0.2 }}>•</span>)}
                </div>

                {error && <div style={{ color: '#ff3b30', marginBottom: '1rem' }}>{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '1rem' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            style={{
                                padding: '15px',
                                fontSize: '1.5rem',
                                borderRadius: '50%',
                                border: '1px solid var(--border-color)',
                                background: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                cursor: 'pointer',
                                width: '60px',
                                height: '60px',
                                margin: '0 auto'
                            }}
                        >
                            {num}
                        </button>
                    ))}
                    <div />
                    <button
                        onClick={() => handleNumberClick('0')}
                        style={{
                            padding: '15px',
                            fontSize: '1.5rem',
                            borderRadius: '50%',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            color: 'var(--text-color)',
                            cursor: 'pointer',
                            width: '60px',
                            height: '60px',
                            margin: '0 auto'
                        }}
                    >
                        0
                    </button>
                    <button
                        onClick={handleClear}
                        style={{
                            padding: '15px',
                            fontSize: '1rem',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-color)',
                            cursor: 'pointer',
                            width: '60px',
                            height: '60px',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ⌫
                    </button>
                </div>

                <button
                    className="close-modal"
                    onClick={onClose}
                    style={{ marginTop: '1rem' }}
                >
                    Annuler
                </button>
            </div>
        </div>
    );
};

export default PinModal;
