import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';
import { playPositive, playNegative, playVictory } from '../utils/sounds';
import ActivityLog from './ActivityLog';
import EvolutionChart from './EvolutionChart';

// ... (existing imports)


import PinModal from './PinModal';
import WeeklyRecapModal from './WeeklyRecapModal';
import StatisticsDashboard from './StatisticsDashboard';
import DeleteConfirmModal from './DeleteConfirmModal';

const ChildDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { kids, logAction, actions, validateWeek, pin, logs, addAction, deleteLog, deleteAction } = useData();

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
    const [statsModalOpen, setStatsModalOpen] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // id
    const [deleteType, setDeleteType] = useState(null); // 'log' or 'action-def'

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

    const executeDeleteLog = (logId) => {
        deleteLog(logId);
    };

    const handleDeleteLogRequest = (logId) => {
        if (pin) {
            setPendingAction({ type: 'delete-log', payload: logId });
            setPinModalOpen(true);
        } else {
            setItemToDelete(logId);
            setDeleteType('log');
            setDeleteModalOpen(true);
        }
    };

    const handleDeleteDefinition = (actionId) => {
        if (pin) {
            setPendingAction({ type: 'delete-action-def', payload: actionId });
            setPinModalOpen(true);
        } else {
            setItemToDelete(actionId);
            setDeleteType('action-def');
            setDeleteModalOpen(true);
        }
    };

    const confirmDelete = () => {
        if (deleteType === 'log') {
            executeDeleteLog(itemToDelete);
        } else if (deleteType === 'action-def') {
            deleteAction(itemToDelete);
        }
        setDeleteModalOpen(false);
        setItemToDelete(null);
        setDeleteType(null);
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
        if (!pendingAction) return;

        switch (pendingAction.type) {
            case 'log':
                executeLogAction(pendingAction.payload);
                break;
            case 'log-batch':
                executeBatchLog(pendingAction.payload);
                break;
            case 'validate':
                executeValidateWeek();
                break;
            case 'delete-log':
                executeDeleteLog(pendingAction.payload);
                break;
            case 'delete-action-def':
                deleteAction(pendingAction.payload);
                break;
            default:
                break;
        }
        setPendingAction(null);
        setPinModalOpen(false);
    };

    const modalActions = actions.filter(a => a.type === actionType);

    // Friday Check
    const isFriday = new Date().getDay() === 5;
    // Saturday Check
    const isSaturday = new Date().getDay() === 6;

    const getActionColor = (id) => {
        if (id.startsWith('sc')) return '#e8f5e9';  // School (Green)
        if (id.startsWith('hm')) return '#e3f2fd';  // Home (Blue)
        if (id.startsWith('bh')) return '#f3e5f5';  // Behavior (Purple)
        if (id.startsWith('hy')) return '#fff3e0';  // Hygiene (Orange)
        if (id.startsWith('tb')) return '#ffebee';  // Table (Red/Pink)
        if (id.startsWith('sl')) return '#e0f7fa';  // Sleep (Cyan)
        return '#ffffff';
    };

    const getCategoryLabel = (id) => {
        if (id.startsWith('sc')) return 'ÉCOLE & DEVOIRS';
        if (id.startsWith('hm')) return 'MAISON & CHAMBRE';
        if (id.startsWith('bh')) return 'COMPORTEMENT';
        if (id.startsWith('hy')) return 'HYGIÈNE';
        if (id.startsWith('tb')) return 'REPAS & TABLE';
        if (id.startsWith('sl')) return 'SOMMEIL & ÉCRANS';
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
        'MAISON & CHAMBRE',
        'COMPORTEMENT',
        'HYGIÈNE',
        'REPAS & TABLE',
        'SOMMEIL & ÉCRANS',
        'AUTRES'
    ];

    const getPrefixFromCategory = (category) => {
        switch (category) {
            case 'ÉCOLE & DEVOIRS': return 'sc';
            case 'MAISON & CHAMBRE': return 'hm';
            case 'COMPORTEMENT': return 'bh';
            case 'HYGIÈNE': return 'hy';
            case 'REPAS & TABLE': return 'tb';
            case 'SOMMEIL & ÉCRANS': return 'sl';
            default: return 'ot';
        }
    };

    const handleAddCustomAction = (category) => {
        const label = prompt(`Nom de l'action pour "${category}" :`);
        if (!label) return;

        const defaultPoints = actionType === 'good' ? 1 : -1;
        const valueStr = prompt(`Points pour "${label}" (ex: ${defaultPoints}) :`, defaultPoints);

        let value = parseFloat(valueStr);
        if (isNaN(value)) value = defaultPoints;

        // Ensure negative for 'bad' type if user enters positive
        if (actionType === 'bad' && value > 0) value = -value;
        // Ensure positive for 'good' type
        if (actionType === 'good' && value < 0) value = -value;

        const prefix = getPrefixFromCategory(category);
        addAction(label, actionType, value, prefix);
    };

    return (
        <div className={`dashboard-simple ${lightning ? 'shake-effect' : ''}`}>
            {lightning && (
                <div className="lightning-flash">
                    <div className="lightning-icon">⚡</div>
                </div>
            )}
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
                        background: 'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)',
                        color: '#555',
                        padding: '2rem',
                        borderRadius: '24px',
                        textAlign: 'center',
                        fontWeight: '800',
                        fontSize: '1.8rem',
                        marginBottom: '2rem',
                        border: '4px solid #fff',
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
                            ? 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'
                            : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
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

                <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setStatsModalOpen(true)}
                        style={{
                            flex: 1,
                            background: '#fff',
                            color: 'var(--text-color)',
                            border: '1px solid #ccc',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        📊 Statistiques
                    </button>
                    <button
                        onClick={handleValidateWeek}
                        style={{
                            flex: 1,
                            background: 'var(--accent-color)',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                    >
                        Valider la semaine
                    </button>
                </div>

                <div className="kid-actions" style={{ gap: '3rem', marginTop: '1rem', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <button
                            className="btn-check"
                            style={{ width: '100px', height: '60px', fontSize: '1rem', margin: '0 auto 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => openActionModal('good')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Bonne action</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            className="btn-cross"
                            style={{ width: '100px', height: '60px', fontSize: '1rem', margin: '0 auto 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => openActionModal('bad')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                            </svg>
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-color)' }}>Bêtise</span>
                    </div>
                </div>

                <ActivityLog logs={logs} actions={actions} childId={kid.id} onDelete={handleDeleteLogRequest} />

                <div style={{ marginBottom: '2rem', width: '100%' }}>
                    <EvolutionChart history={kid.history} />
                </div>
            </div>

            {
                modalOpen && (
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
                                                        <div key={action.id} style={{ position: 'relative' }}>
                                                            <button
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
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteDefinition(action.id);
                                                                }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '-8px',
                                                                    right: '-8px',
                                                                    background: 'white',
                                                                    border: '1px solid #ff3b30',
                                                                    borderRadius: '50%',
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                    color: '#ff3b30',
                                                                    transition: 'transform 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                    e.currentTarget.style.background = '#ff3b30';
                                                                    e.currentTarget.style.color = 'white';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.background = 'white';
                                                                    e.currentTarget.style.color = '#ff3b30';
                                                                }}
                                                                title="Supprimer cette action"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {/* Custom Action Button */}
                                                <button
                                                    className="action-option-btn"
                                                    onClick={() => handleAddCustomAction(category)}
                                                    style={{
                                                        background: 'transparent',
                                                        color: '#888',
                                                        border: '2px dashed #ccc',
                                                        width: '100%',
                                                        margin: 0,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        padding: '15px',
                                                        cursor: 'pointer',
                                                        minHeight: '60px'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>+</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {
                                isMultiSelect ? (
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
                                )
                            }
                        </div>
                    </div>
                )
            }

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

            <StatisticsDashboard
                isOpen={statsModalOpen}
                onClose={() => setStatsModalOpen(false)}
                logs={logs.filter(l => l.childId === kid.id)}
                actions={actions}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={deleteType === 'log' ? "Supprimer cet historique ?" : "Supprimer cette action ?"}
                message={deleteType === 'log'
                    ? "Cette action sera retirée de l'historique et les points seront ajustés."
                    : "Cette action ne sera plus disponible dans la liste."}
            />
        </div >
    );
};

export default ChildDetail;
