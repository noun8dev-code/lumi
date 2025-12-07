import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import PinModal from './PinModal';
import SyncModal from './SyncModal';
import PaymentModal from './PaymentModal';
import DeleteConfirmModal from './DeleteConfirmModal';



const Home = () => {
    const { kids, addChild, removeChild, theme, toggleTheme, pin, setAppPin, familyId, createFamily, joinFamily } = useData();
    const navigate = useNavigate();
    const [newChildName, setNewChildName] = useState('');

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
                        {pin ? '⚙️' : '🔒'}
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => setSyncModalOpen(true)}
                        title="Synchronisation"
                    >
                        ☁️
                    </button>
                    <button
                        className="icon-btn"
                        onClick={toggleTheme}
                        title="Changer de thème"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
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
                            '📸'
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
