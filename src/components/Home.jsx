import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import PinModal from './PinModal';
import SyncModal from './SyncModal';



const Home = () => {
    const { kids, addChild, theme, toggleTheme, pin, setAppPin, familyId, createFamily, joinFamily } = useData();
    const [newChildName, setNewChildName] = useState('');

    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [syncModalOpen, setSyncModalOpen] = useState(false);

    const handlePinSuccess = (newPin) => {
        setAppPin(newPin);
        alert('Code PIN défini avec succès !');
    };

    const handleAddChild = () => {
        if (newChildName.trim()) {
            addChild(newChildName);
            setNewChildName('');
        }
    };



    return (
        <div className="dashboard-simple">
            <header className="simple-header">
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setPinModalOpen(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '12px',
                            transition: 'transform 0.2s',
                            color: 'var(--text-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Paramètres (Code PIN)"
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                        ⚙️
                    </button>
                    <button
                        onClick={() => setSyncModalOpen(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '12px',
                            transition: 'transform 0.2s',
                            color: 'var(--text-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Synchronisation"
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                        ☁️
                    </button>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            transition: 'transform 0.2s',
                            color: 'var(--text-color)',
                            fontWeight: '500'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                        {theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
                    </button>
                </div>

                <h1>Sage ou Pas ?</h1>
                <p>Suivez le comportement des enfants.</p>



                <div className="add-bar">
                    <input
                        type="text"
                        placeholder="Ajouter un enfant..."
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddChild()}
                    />
                    <button onClick={handleAddChild}>+</button>
                </div>
            </header>

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
                isOpen={pinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onSuccess={handlePinSuccess}
                title={pin ? "Changer le code PIN" : "Définir un code PIN"}
                setMode={true}
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
