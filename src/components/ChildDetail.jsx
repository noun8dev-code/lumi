import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { playPositive, playNegative, playVictory } from '../utils/sounds';
import EvolutionChart from './EvolutionChart';
import PinModal from './PinModal';

const ChildDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { kids, logAction, actions, validateWeek, pin } = useData();

    // Find the child
    const kid = kids.find(k => k.id === id);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'good' or 'bad'
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // { type: 'log' | 'validate', payload: ... }

    if (!kid) {
        return (
            <div className="dashboard-simple" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>Enfant introuvable</h2>
                <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Retour à l'accueil</Link>
            </div>
        );
    }

    const openActionModal = (type) => {
        setActionType(type);
        setModalOpen(true);
    };

    const handleActionSelect = (actionId) => {
        // alert('DEBUG: PIN is ' + pin); // Debugging
        if (pin) {
            setPendingAction({ type: 'log', payload: actionId });
            setPinModalOpen(true);
            setModalOpen(false);
        } else {
            executeLogAction(actionId);
            setModalOpen(false);
        }
    };

    const executeLogAction = (actionId) => {
        const action = actions.find(a => a.id === actionId);
        if (action) {
            if (action.type === 'good') playPositive();
            else playNegative();
        }
        logAction(kid.id, actionId);
        setActionType(null);
    };

    const handleValidateWeek = () => {
        if (window.confirm("Es-tu sûr de vouloir valider la semaine ? Le score reviendra à 10.")) {
            if (pin) {
                setPendingAction({ type: 'validate' });
                setPinModalOpen(true);
            } else {
                executeValidateWeek();
            }
        }
    };

    const executeValidateWeek = () => {
        if (kid.score >= 9.5) playVictory();
        validateWeek(kid.id);
    };

    const handlePinSuccess = () => {
        if (pendingAction) {
            if (pendingAction.type === 'log') {
                executeLogAction(pendingAction.payload);
            } else if (pendingAction.type === 'validate') {
                executeValidateWeek();
            }
            setPendingAction(null);
        }
    };

    // Filter actions for the modal
    const modalActions = actions.filter(a => a.type === actionType);

    // Friday Check
    const isFriday = new Date().getDay() === 5;

    const getActionColor = (id) => {
        if (id.startsWith('school')) return '#e8f5e9'; // Green
        if (id.startsWith('home')) return '#e3f2fd';   // Blue
        if (id.startsWith('behav')) return '#f3e5f5';  // Purple
        if (id.startsWith('hyg')) return '#fff3e0';    // Orange
        return '#ffffff';
    };

    const getCategoryLabel = (id) => {
        if (id.startsWith('school')) return 'ÉCOLE & DEVOIRS';
        if (id.startsWith('home')) return 'MAISON & TÂCHES';
        if (id.startsWith('behav')) return 'COMPORTEMENT';
        if (id.startsWith('hyg')) return 'HYGIÈNE & SOINS';
        return 'AUTRES';
    };

    // Group actions by category
    const groupedActions = modalActions.reduce((acc, action) => {
        const category = getCategoryLabel(action.id);
        if (!acc[category]) acc[category] = [];
        acc[category].push(action);
        return acc;
    }, {});

    // Define order of categories
    const categoryOrder = [
        'ÉCOLE & DEVOIRS',
        'MAISON & TÂCHES',
        'COMPORTEMENT',
        'HYGIÈNE & SOINS',
        'AUTRES'
    ];


    return (
        <div className="dashboard-simple">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '500' }}>
                    ‹ Retour
                </Link>
            </div>

            <div className="kid-item" style={{ transform: 'none', cursor: 'default' }}>
                <h1 className="kid-name" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{kid.name}</h1>

                <div className="kid-status">
                    {kid.score >= 5 ? (
                        <span className="status-good" style={{ fontSize: '1.5rem' }}>Est sage ({kid.score})</span>
                    ) : (
                        <span className="status-bad" style={{ fontSize: '1.5rem' }}>N'est pas sage ({kid.score})</span>
                    )}
                </div>

                {isFriday && (
                    <div style={{
                        background: '#FFF9C4', // Light yellow
                        color: '#F57F17', // Dark orange/yellow text
                        padding: '1.5rem',
                        borderRadius: '16px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        marginBottom: '2rem',
                        border: '2px solid #FBC02D',
                        boxShadow: '0 4px 15px rgba(251, 192, 45, 0.2)',
                        animation: 'pulse 2s infinite'
                    }}>
                        N'oubliez pas la récompense !!!
                    </div>
                )}

                {/* Reward Card */}


                {/* Validate Week Button */}
                <button
                    onClick={handleValidateWeek}
                    style={{
                        background: 'var(--accent-color)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        width: '100%'
                    }}
                >
                    Valider la semaine (Reset)
                </button>

                <div className="kid-actions" style={{ gap: '3rem', marginTop: '1rem', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <button
                            className="btn-check"
                            style={{ width: '100px', height: '60px', fontSize: '1rem', margin: '0 auto 10px', borderRadius: '12px' }}
                            onClick={() => openActionModal('good')}
                        >
                            Bonne action
                        </button>

                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            className="btn-cross"
                            style={{ width: '100px', height: '60px', fontSize: '1rem', margin: '0 auto 10px', borderRadius: '12px' }}
                            onClick={() => openActionModal('bad')}
                        >
                            Bêtise
                        </button>

                    </div>
                </div>

                <div style={{ marginBottom: '2rem', width: '100%' }}>
                    <EvolutionChart history={kid.history} />
                </div>




            </div>

            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>
                            {actionType === 'good' ? 'Quelle bonne action ?' : 'Quelle bêtise ?'}
                        </h3>
                        <div className="action-options" style={{ display: 'block' }}>
                            {categoryOrder.map(category => {
                                if (!groupedActions[category]) return null;
                                return (
                                    <div key={category} style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{
                                            margin: '0 0 0.5rem 0',
                                            color: 'var(--text-color)',
                                            opacity: 0.7,
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            {category}
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                                            {groupedActions[category].map(action => (
                                                <button
                                                    key={action.id}
                                                    className="action-option-btn"
                                                    onClick={() => handleActionSelect(action.id)}
                                                    style={{
                                                        background: getActionColor(action.id),
                                                        color: '#333',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        width: '100%',
                                                        margin: 0,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '15px'
                                                    }}
                                                >
                                                    <span style={{ textAlign: 'left', flex: 1, fontSize: '0.9rem' }}>{action.label}</span>
                                                    <span style={{
                                                        fontSize: '1.2rem',
                                                        fontWeight: 'bold',
                                                        marginLeft: '10px',
                                                        color: action.value > 0 ? '#2e7d32' : '#c62828'
                                                    }}>
                                                        {action.value > 0 ? '+' + action.value : action.value}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="close-modal" onClick={() => setModalOpen(false)}>Annuler</button>
                    </div>
                </div>
            )}

            <PinModal
                isOpen={pinModalOpen}
                onClose={() => {
                    setPinModalOpen(false);
                    setPendingAction(null);
                }}
                onSuccess={handlePinSuccess}
                correctPin={pin}
            />
        </div>
    );
};

export default ChildDetail;
