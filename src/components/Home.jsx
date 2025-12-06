import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import PinModal from './PinModal';
import SyncModal from './SyncModal';
import PaymentModal from './PaymentModal';



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

    const handleDeleteChild = (e, childId, childName) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event bubbling

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${childName} ?`)) {
            removeChild(childId);
        }
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
                                onClick={(e) => handleDeleteChild(e, kid.id, kid.name)}
                                style={{
                                    background: '#ff3b30',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '10px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}
                                title="Supprimer"
                            >
                                🗑️
                            </button>
                            <span style={{ fontWeight: 'bold', color: kid.score >= 5 ? '#34c759' : '#ff3b30' }}>
                                {kid.score}
                            </span>
                            <span style={{ color: '#86868b', fontSize: '1.2rem' }}>›</span>
                        </div>
                    </div>
                ))}
            </div>

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
        </div>
    );
};

export default Home;
