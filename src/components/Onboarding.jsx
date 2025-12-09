import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Welcome, 2: Tutorial

    const handleNext = () => {
        if (step === 2) {
            // Finish
            localStorage.setItem('sop_onboarding_completed', 'true');
            navigate('/');
        } else {
            setStep(step + 1);
        }
    };

    return (
        <div className="dashboard-simple" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px var(--shadow-color)' }}>
                {/* Progress Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: step === s ? 'var(--accent-color)' : 'var(--border-color)',
                            transition: 'background 0.3s'
                        }} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="fade-in">
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👋 Bienvenue !</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--subtext-color)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Découvrez une façon ludique et positive d'encourager les bons comportements de vos enfants.
                        </p>
                        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🚀</div>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in">
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Comment ça marche ?</h2>
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px' }}>
                                <span style={{ fontSize: '2rem' }}>👍</span>
                                <div>
                                    <strong>Bonnes actions</strong>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--subtext-color)', margin: 0 }}>Font grimper le score vers 10/10 !</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px' }}>
                                <span style={{ fontSize: '2rem' }}>👎</span>
                                <div>
                                    <strong>Bêtises</strong>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--subtext-color)', margin: 0 }}>Font baisser le score (mais on peut se rattraper !)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleNext}
                    style={{
                        marginTop: '2rem',
                        width: '100%',
                        padding: '16px',
                        background: 'var(--accent-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                >
                    {step === 2 ? "C'est parti !" : "Continuer"}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
