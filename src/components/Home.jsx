import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import PinModal from './PinModal';
import SyncModal from './SyncModal';



const Home = () => {
    const { kids, addChild, theme, toggleTheme, pin, setAppPin, familyId, createFamily, joinFamily } = useData();
    const [newChildName, setNewChildName] = useState('');

    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pinStep, setPinStep] = useState('check'); // 'check' | 'set'
    const [syncModalOpen, setSyncModalOpen] = useState(false);
    const [pendingChildName, setPendingChildName] = useState(null);

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
            addChild(pendingChildName);
            setNewChildName('');
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

    const handleAddChild = () => {
        if (!newChildName.trim()) return;

        if (pin) {
            setPendingChildName(newChildName.trim());
            setPinStep('check');
            setPinModalOpen(true);
        } else {
            addChild(newChildName.trim());
            setNewChildName('');
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
                    <Link key={kid.id} to={`/child/${kid.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="kid-item" style={{ cursor: 'pointer', flexDirection: 'row', justifyContent: 'space-between', padding: '1.5rem 2rem' }}>
                            <h2 className="kid-name" style={{ margin: 0, fontSize: '1.5rem' }}>{kid.name}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontWeight: 'bold', color: kid.score >= 5 ? '#34c759' : '#ff3b30' }}>
                                    {kid.score}
                                </span>
                                <span style={{ color: '#86868b', fontSize: '1.2rem' }}>›</span>
                            </div>
                        </div>
                    </Link>
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
        </div>
    );
};

export default Home;
