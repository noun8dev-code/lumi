import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Compte créé ! Veuillez vérifier votre email (si confirmation requise) ou connectez-vous.');
                setIsSignUp(false); // Switch to login after signup
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (error) {
            setMessage(error.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-simple" style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', color: 'var(--header-text)' }}>
                {isSignUp ? 'Créer un compte' : 'Connexion'}
            </h1>

            <div style={{
                background: 'var(--card-bg)',
                padding: '2rem',
                borderRadius: '24px',
                boxShadow: '0 10px 30px var(--shadow-color)'
            }}>
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="ios-input-group">
                        <span style={{ fontSize: '1.2rem', paddingLeft: '10px' }}>✉️</span>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="ios-input-group">
                        <span style={{ fontSize: '1.2rem', paddingLeft: '10px' }}>🔒</span>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0 10px',
                                fontSize: '1.2rem'
                            }}
                            title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>

                    {message && <p style={{ color: message.includes('créé') ? 'green' : 'red', fontSize: '0.9rem' }}>{message}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            padding: '16px',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'wait' : 'pointer',
                            transition: 'transform 0.2s',
                            marginTop: '1rem'
                        }}
                    >
                        {loading ? 'Chargement...' : (isSignUp ? "S'inscrire" : 'Se connecter')}
                    </button>
                </form>

                <div style={{ marginTop: '2rem' }}>
                    <p style={{ color: 'var(--subtext-color)' }}>
                        {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setMessage('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-color)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                marginLeft: '5px',
                                textDecoration: 'underline'
                            }}
                        >
                            {isSignUp ? 'Se connecter' : "S'inscrire"}
                        </button>
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--subtext-color)',
                            marginTop: '1rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
