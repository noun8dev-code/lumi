import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';
import { playPositive, playNegative, playVictory } from '../utils/sounds';
import EvolutionChart from './EvolutionChart';
import PinModal from './PinModal';
import WeeklyRecapModal from './WeeklyRecapModal';

const ChildDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { kids, logAction, actions, validateWeek, pin, logs } = useData();

    // Find the child
    const kid = kids.find(k => k.id === id);
    const prevScoreRef = useRef(kid?.score);
    const [lightning, setLightning] = useState(false);

    // Confetti & Lightning Effect
    useEffect(() => {
        if (kid) {
            const currentScore = kid.score;
            const prevScore = prevScoreRef.current;

            // Initialize ref if undefined
            if (prevScore === undefined) {
                prevScoreRef.current = currentScore;
                return;
            }

            // Only trigger if score is high AND it has increased
            if (currentScore > 9 && currentScore > prevScore) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
            // Trigger lightning if score DECREASED
            else if (currentScore < prevScore) {
                setLightning(true);
                setTimeout(() => setLightning(false), 500);
            }
            // Update previous score
            prevScoreRef.current = currentScore;
        }
    }, [kid?.score]);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'good' or 'bad'
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // { type: 'log' | 'validate' | 'log-batch', payload: ... }
    const [recapModalOpen, setRecapModalOpen] = useState(false);

    // Multi-Select State
    const [isMultiSelect, setIsMultiSelect] = useState(false);
    const [selectedActions, setSelectedActions] = useState(new Set());

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
        // Reset multi-select on open
        setIsMultiSelect(false);
        setSelectedActions(new Set());
    };

    const toggleActionSelection = (actionId) => {
        const newSelection = new Set(selectedActions);
        if (newSelection.has(actionId)) {
            newSelection.delete(actionId);
        } else {
            newSelection.add(actionId);
        }
        setSelectedActions(newSelection);
    };

    const handleActionClick = (actionId) => {
        if (isMultiSelect) {
            toggleActionSelection(actionId);
        } else {
            handleActionSelect(actionId);
        }
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

    const handleBatchSubmit = () => {
        if (selectedActions.size === 0) return;

        const actionsToLog = Array.from(selectedActions);

        if (pin) {
            setPendingAction({ type: 'log-batch', payload: actionsToLog });
            setPinModalOpen(true);
            setModalOpen(false);
        } else {
            executeBatchLog(actionsToLog);
            setModalOpen(false);
        }
    };

    const executeBatchLog = (actionIds) => {
        // Calculate total value for sound effect
        let totalValue = 0;
        actionIds.forEach(id => {
            const action = actions.find(a => a.id === id);
            if (action) totalValue += action.value;
            logAction(kid.id, id);
        });

        if (totalValue > 0) playPositive();
        else if (totalValue < 0) playNegative();

        setActionType(null);
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
        // Open Recap Modal instead of window.confirm
        setRecapModalOpen(true);
    };

    const handleConfirmValidateWeek = () => {
        setRecapModalOpen(false); // Close recap
        if (pin) {
            setPendingAction({ type: 'validate' });
            setPinModalOpen(true);
        } else {
            executeValidateWeek();
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
            } else if (pendingAction.type === 'log-batch') {
                executeBatchLog(pendingAction.payload);
            }
            setPendingAction(null);
        }
    };

    // Filter actions for the modal
    const modalActions = actions.filter(a => a.type === actionType);

    // Friday Check
    const isFriday = new Date().getDay() === 5;
    // Saturday Check
    const isSaturday = new Date().getDay() === 6;

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
        <div className={`dashboard-simple ${lightning ? 'shake-effect' : ''}`}>
            {lightning && <div className="lightning-flash"></div>}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '500' }}>
                    ‹ Retour
                </Link>
            </div>

            <div className="kid-item" style={{ transform: 'none', cursor: 'default' }}>
                {kid.avatar && (
                    <img
                        src={kid.avatar}
                        alt={kid.name}
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid white',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                            marginBottom: '1rem'
                        }}
                    />
                )}
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
                        background: 'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)', // Pastel Pink to Blue
                        color: '#555', // Soft dark gray
                        padding: '2rem',
                        borderRadius: '24px',
                        textAlign: 'center',
                        fontWeight: '800',
                        fontSize: '1.8rem',
                        marginBottom: '2rem',
                        border: '4px solid #fff', // White border for "sticker" look
                        boxShadow: '0 10px 30px rgba(181, 255, 252, 0.5)',
                        animation: 'pulse 3s infinite ease-in-out',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        N'oubliez pas la récompense !!!
                    </div>
                )}

                {isSaturday && (
                    <div style={{
                        background: kid.score >= 8
                            ? 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' // Greenish for good
                            : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', // Reddish for bad
                        color: '#555',
                        padding: '2rem',
                        borderRadius: '24px',
                        textAlign: 'center',
                        fontWeight: '800',
                        fontSize: '1.8rem',
                        marginBottom: '2rem',
                        border: '4px solid #fff',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {kid.score >= 8 ? "C'est l'heure de la récompense" : "Pas de récompense"}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>
                                {actionType === 'good' ? 'Quelle bonne action ?' : 'Quelle bêtise ?'}
                            </h3>
                            <div
                                onClick={() => {
                                    setIsMultiSelect(!isMultiSelect);
                                    setSelectedActions(new Set());
                                }}
                                style={{
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    background: isMultiSelect ? 'var(--accent-color)' : '#eee',
                                    color: isMultiSelect ? 'white' : '#555',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isMultiSelect ? '✓ Choix Multiple ON' : 'Choix Multiple'}
                            </div>
                        </div>

                        <div className="action-options" style={{ display: 'block', maxHeight: '60vh', overflowY: 'auto' }}>
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
                                            {groupedActions[category].map(action => {
                                                const isSelected = selectedActions.has(action.id);
                                                return (
                                                    <button
                                                        key={action.id}
                                                        className="action-option-btn"
                                                        onClick={() => handleActionClick(action.id)}
                                                        style={{
                                                            background: isSelected ? 'var(--accent-color)' : getActionColor(action.id),
                                                            color: isSelected ? 'white' : '#333',
                                                            border: isSelected ? '2px solid var(--accent-color)' : '1px solid rgba(0,0,0,0.1)',
                                                            width: '100%',
                                                            margin: 0,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '15px',
                                                            transform: isSelected ? 'scale(0.98)' : 'none',
                                                            transition: 'all 0.1s'
                                                        }}
                                                    >
                                                        <span style={{ textAlign: 'left', flex: 1, fontSize: '0.9rem' }}>{action.label}</span>
                                                        <span style={{
                                                            fontSize: '1.2rem',
                                                            fontWeight: 'bold',
                                                            marginLeft: '10px',
                                                            color: isSelected ? 'white' : (action.value > 0 ? '#2e7d32' : '#c62828')
                                                        }}>
                                                            {action.value > 0 ? '+' + action.value : action.value}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {isMultiSelect ? (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button className="close-modal" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>Annuler</button>
                                <button
                                    onClick={handleBatchSubmit}
                                    disabled={selectedActions.size === 0}
                                    style={{
                                        flex: 2,
                                        background: selectedActions.size > 0 ? 'var(--accent-color)' : '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        cursor: selectedActions.size > 0 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Valider ({selectedActions.size})
                                </button>
                            </div>
                        ) : (
                            <button className="close-modal" onClick={() => setModalOpen(false)}>Annuler</button>
                        )}
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

            <WeeklyRecapModal
                isOpen={recapModalOpen}
                onClose={() => setRecapModalOpen(false)}
                onConfirm={handleConfirmValidateWeek}
                kid={kid}
                logs={logs}
                actions={actions}
            />
        </div>
    );
};

export default ChildDetail;
