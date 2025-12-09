import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import PinModal from './PinModal';
import SyncModal from './SyncModal';
import PaymentModal from './PaymentModal';
import DeleteConfirmModal from './DeleteConfirmModal';



const Home = () => {
    const { kids, addChild, removeChild, theme, toggleTheme, pin, setAppPin, familyId, createFamily, joinFamily, user, logout } = useData();
    const navigate = useNavigate();
    const [newChildName, setNewChildName] = useState('');

    useEffect(() => {
        // If no kids and onboarding not flagged as done, redirect
        const onboardingDone = localStorage.getItem('sop_onboarding_completed');
        if (kids.length === 0 && !onboardingDone) {
            navigate('/onboarding');
        }
    }, [kids, navigate]);

    const [newChildImage, setNewChildImage] = useState(null);

    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pinStep, setPinStep] = useState('check'); // 'check' | 'set'
    const [syncModalOpen, setSyncModalOpen] = useState(false);
    const [pendingChildName, setPendingChildName] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [childToDelete, setChildToDelete] = useState(null);

    const handleDeleteClick = (e, kid) => {
        e.preventDefault();
        e.stopPropagation();
        setChildToDelete(kid);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (childToDelete) {
            removeChild(childToDelete.id);
            setDeleteModalOpen(false);
            setChildToDelete(null);
        }
    };

    const handlePinClick = () => {
        setPendingChildName(null);
        if (pin) {
            setPinStep('check');
        } else {
            setPinStep('set');
        }
        setPinModalOpen(true);
    };

    const handlePinSuccess = (newPin) => {
        if (pendingChildName) {
            // PIN verified for adding child
            addChild(pendingChildName, newChildImage);
            setNewChildName('');
            setNewChildImage(null);
            setPendingChildName(null);
            setPinModalOpen(false);
        } else if (pinStep === 'check') {
            // Verification successful, move to set new pin
            setPinStep('set');
        } else {
            // Setting new pin
            setAppPin(newPin);
            setPinModalOpen(false);
            alert('Code PIN enregistré avec succès !');
        }
    };

    const processAddChild = () => {
        if (pin) {
            setPendingChildName(newChildName.trim());
            setPinStep('check');
            setPinModalOpen(true);
        } else {
            addChild(newChildName.trim(), newChildImage);
            setNewChildName('');
            setNewChildImage(null);
        }
    };

    const handleAddChild = () => {
        if (!newChildName.trim()) return;

        if (!user) {
            if (window.confirm("Pour sécuriser vos données et ajouter un enfant, vous devez vous connecter. Voulez-vous créer un compte ou vous connecter maintenant ?")) {
                navigate('/login');
            }
            return;
        }

        if (kids.length >= 1) {
            setPaymentModalOpen(true);
        } else {
            processAddChild();
        }
    };

    const handlePaymentConfirm = () => {
        setPaymentModalOpen(false);
        processAddChild();
    };



    const handleNavigate = (id) => {
        navigate(`/child/${id}`);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewChildImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="dashboard-simple">
            <div className="ios-header">
                <div className="header-actions">
                    <button
                        className={`icon-btn ${!pin ? 'pulse-action' : ''}`}
                        onClick={handlePinClick}
                        title={pin ? "Paramètres PIN" : "Définir PIN"}
                    >
                        {/* Lock / Settings Icon */}
                        {pin ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        )}
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => setSyncModalOpen(true)}
                        title="Ajouter une famille"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => {
                            if (user) {
                                if (window.confirm("Se déconnecter ?")) {
                                    logout();
                                }
                            } else {
                                navigate('/login');
                            }
                        }}
                        title={user ? "Se déconnecter" : "Connexion"}
                    >
                        {user ? (
                            // Logout Icon
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        ) : (
                            // Login Icon
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                <polyline points="10 17 15 12 10 7"></polyline>
                                <line x1="15" y1="12" x2="3" y2="12"></line>
                            </svg>
                        )}
                    </button>
                </div>

                <div className="title-section">
                    <h1>Sage ou Pas ?</h1>
                    <p>Suivi du comportement</p>
                </div>

                <div className="ios-input-group">
                    <label htmlFor="child-image-upload" className="icon-btn" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '10px' }}>
                        {newChildImage ? (
                            <img src={newChildImage} alt="Aperçu" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        )}
                    </label>
                    <input
                        id="child-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    <input
                        type="text"
                        placeholder="Ajouter un enfant..."
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddChild()}
                    />
                    <button onClick={handleAddChild} className="add-btn">
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
                    </button>
                </div>
            </div>

            <div className="kids-list-simple">
                {kids.map(kid => (
                    <div
                        key={kid.id}
                        className="kid-item"
                        onClick={() => handleNavigate(kid.id)}
                        style={{ cursor: 'pointer', flexDirection: 'row', justifyContent: 'space-between', padding: '1.5rem 2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {kid.avatar && (
                                <img
                                    src={kid.avatar}
                                    alt={kid.name}
                                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                />
                            )}
                            <h2 className="kid-name" style={{ margin: 0, fontSize: '1.5rem' }}>{kid.name}</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={(e) => handleDeleteClick(e, kid)}
                                className="delete-btn-modern"
                                title="Supprimer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                            <span style={{ fontWeight: 'bold', color: kid.score >= 5 ? '#34c759' : '#ff3b30' }}>
                                {kid.score}
                            </span>
                            <span style={{ color: '#86868b', fontSize: '1.2rem' }}>›</span>
                        </div>
                    </div>
                ))}
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={`Supprimer ${childToDelete?.name} ?`}
                message="Cette action est irréversible. Tout l'historique sera perdu."
            />

            <PinModal
                key={pinStep} // Force re-render when step changes
                isOpen={pinModalOpen}
                onClose={() => {
                    setPinModalOpen(false);
                    setPendingChildName(null);
                }}
                onSuccess={handlePinSuccess}
                title={pendingChildName ? "Code PIN requis" : (pinStep === 'check' ? "Entrez le code actuel" : "Définir le nouveau code")}
                setMode={pinStep === 'set' && !pendingChildName}
                correctPin={pin}
                closeOnSuccess={pinStep !== 'check' || pendingChildName}
            />

            <SyncModal
                isOpen={syncModalOpen}
                onClose={() => setSyncModalOpen(false)}
                onCreateFamily={createFamily}
                onJoinFamily={joinFamily}
                currentFamilyId={familyId}
            />

            <PaymentModal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onConfirm={handlePaymentConfirm}
            />

            <style>{`
                .delete-btn-modern {
                    background: white;
                    color: #ff3b30;
                    border: 1px solid #ff3b30;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    margin-right: 10px;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .delete-btn-modern:hover {
                    background: #ff3b30;
                    color: white;
                    transform: scale(1.1) rotate(5deg);
                    box-shadow: 0 4px 8px rgba(255, 59, 48, 0.3);
                }
                .kid-item {
                    transition: transform 0.2s;
                }
                .kid-item:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
};

export default Home;
