import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const DataContext = createContext();

const INITIAL_ACTIONS = [
    // --- ÉCOLE & DEVOIRS ---
    { id: 'school_1', label: 'A fait ses devoirs', type: 'good', value: 1.0 },
    { id: 'school_2', label: 'A eu une bonne note', type: 'good', value: 2.0 },
    { id: 'school_3', label: 'A préparé son cartable', type: 'good', value: 0.5 },
    { id: 'school_4', label: 'A eu un bon comportement', type: 'good', value: 1.0 },
    { id: 'school_5', label: 'A bien participé en classe', type: 'good', value: 0.5 },
    { id: 'school_6', label: 'A écouté la maîtresse', type: 'good', value: 0.5 },
    { id: 'school_7', label: 'A lu un livre', type: 'good', value: 1.0 },
    { id: 'school_bad_1', label: 'A eu un mot dans le carnet', type: 'bad', value: -2.0 },
    { id: 'school_bad_2', label: 'A oublié ses affaires', type: 'bad', value: -0.5 },
    { id: 'school_bad_3', label: 'N\'a pas fait ses devoirs', type: 'bad', value: -1.0 },
    { id: 'school_bad_4', label: 'A bavardé en classe', type: 'bad', value: -0.5 },
    { id: 'school_bad_5', label: 'Est arrivé en retard', type: 'bad', value: -0.5 },

    // --- MAISON & TÂCHES ---
    { id: 'home_1', label: 'A rangé sa chambre', type: 'good', value: 1.0 },
    { id: 'home_2', label: 'A fait son lit', type: 'good', value: 0.5 },
    { id: 'home_3', label: 'A mis la table', type: 'good', value: 0.5 },
    { id: 'home_4', label: 'A débarrassé la table', type: 'good', value: 0.5 },
    { id: 'home_5', label: 'A vidé le lave-vaisselle', type: 'good', value: 1.0 },
    { id: 'home_6', label: 'A sorti la poubelle', type: 'good', value: 1.0 },
    { id: 'home_7', label: 'A rangé ses jouets', type: 'good', value: 0.5 },
    { id: 'home_8', label: 'A aidé à cuisiner', type: 'good', value: 1.0 },
    { id: 'home_9', label: 'A arrosé les plantes', type: 'good', value: 0.5 },
    { id: 'home_10', label: 'A plié son linge', type: 'good', value: 1.0 },
    { id: 'home_bad_1', label: 'A laissé traîner ses affaires', type: 'bad', value: -0.5 },
    { id: 'home_bad_2', label: 'A cassé quelque chose', type: 'bad', value: -1.0 },
    { id: 'home_bad_3', label: 'A sali la maison', type: 'bad', value: -0.5 },
    { id: 'home_bad_4', label: 'N\'a pas éteint la lumière', type: 'bad', value: -0.5 },
    { id: 'home_bad_5', label: 'A claqué une porte', type: 'bad', value: -0.5 },

    // --- COMPORTEMENT & FAMILLE ---
    { id: 'behav_1', label: 'A obéi tout de suite', type: 'good', value: 1.0 },
    { id: 'behav_2', label: 'A aidé Papa/Maman', type: 'good', value: 1.5 },
    { id: 'behav_3', label: 'N\'a pas fait répéter', type: 'good', value: 0.5 },
    { id: 'behav_4', label: 'A été poli(e)', type: 'good', value: 0.5 },
    { id: 'behav_5', label: 'A fait un câlin', type: 'good', value: 0.5 },
    { id: 'behav_6', label: 'A joué calmement', type: 'good', value: 0.5 },
    { id: 'behav_7', label: 'A partagé', type: 'good', value: 1.0 },
    { id: 'behav_8', label: 'A dit la vérité (courage)', type: 'good', value: 1.0 },
    { id: 'behav_9', label: 'A demandé pardon', type: 'good', value: 0.5 },
    { id: 'behav_bad_1', label: 'A fait crier Papa/Maman', type: 'bad', value: -1.5 },
    { id: 'behav_bad_2', label: 'A obligé à répéter', type: 'bad', value: -0.5 },
    { id: 'behav_bad_3', label: 'A répondu / insolent', type: 'bad', value: -2.0 },
    { id: 'behav_bad_4', label: 'A fait une colère', type: 'bad', value: -1.0 },
    { id: 'behav_bad_5', label: 'A tapé / mordu', type: 'bad', value: -3.0 },
    { id: 'behav_bad_6', label: 'A menti', type: 'bad', value: -2.0 },
    { id: 'behav_bad_7', label: 'A dit des gros mots', type: 'bad', value: -1.0 },
    { id: 'behav_bad_8', label: 'A crié', type: 'bad', value: -0.5 },
    { id: 'behav_bad_9', label: 'S\'est battu', type: 'bad', value: -3.0 },
    { id: 'behav_bad_10', label: 'A fait un caprice', type: 'bad', value: -1.0 },
    { id: 'behav_bad_11', label: 'A coupé la parole', type: 'bad', value: -0.5 },

    // --- HYGIÈNE & SOINS ---
    { id: 'hyg_1', label: 'S\'est brossé les dents', type: 'good', value: 0.5 },
    { id: 'hyg_2', label: 'A pris sa douche calme', type: 'good', value: 0.5 },
    { id: 'hyg_3', label: 'S\'est habillé(e) seul', type: 'good', value: 0.5 },
    { id: 'hyg_4', label: 'A mangé ses légumes', type: 'good', value: 1.0 },
    { id: 'hyg_5', label: 'A fini son assiette', type: 'good', value: 0.5 },
    { id: 'hyg_6', label: 'S\'est lavé les mains', type: 'good', value: 0.5 },
    { id: 'hyg_bad_1', label: 'A refusé de manger', type: 'bad', value: -1.0 },
    { id: 'hyg_bad_2', label: 'A refusé d\'aller au lit', type: 'bad', value: -1.0 },
    { id: 'hyg_bad_3', label: 'Ne s\'est pas lavé les mains', type: 'bad', value: -0.5 },
    { id: 'hyg_bad_4', label: 'A mis les coudes sur la table', type: 'bad', value: -0.5 },
];

export const DataProvider = ({ children }) => {
    const [kids, setKids] = useState(() => {
        const saved = localStorage.getItem('sop_kids');
        return saved ? JSON.parse(saved) : [];
    });

    // Force use of INITIAL_ACTIONS to ensure new actions are loaded
    const [actions, setActions] = useState(INITIAL_ACTIONS);

    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem('sop_logs');
        return saved ? JSON.parse(saved) : [];
    });

    // Theme State
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('sop_theme') || 'light';
    });

    // PIN State
    const [pin, setPin] = useState(() => {
        return localStorage.getItem('sop_pin') || null;
    });

    // Family State (Sync)
    const [familyId, setFamilyId] = useState(() => {
        return localStorage.getItem('sop_family_id') || null;
    });

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        localStorage.setItem('sop_theme', theme);
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        if (pin) {
            localStorage.setItem('sop_pin', pin);
        } else {
            localStorage.removeItem('sop_pin');
        }
    }, [pin]);

    // Initial Fetch on Mount / Family Change
    useEffect(() => {
        if (familyId) {
            const fetchFamilyData = async () => {
                const { data, error } = await supabase
                    .from('families')
                    .select('*')
                    .eq('id', familyId)
                    .single();

                if (data) {
                    if (data.kids) {
                        let loadedKids = data.kids;
                        if (typeof loadedKids === 'string') {
                            try {
                                loadedKids = JSON.parse(loadedKids);
                            } catch (e) {
                                console.error("Failed to parse kids JSON", e);
                                loadedKids = [];
                            }
                        }
                        if (Array.isArray(loadedKids)) {
                            setKids(loadedKids);
                        }
                    }
                    if (data.pin) setPin(data.pin);
                }
                setIsInitialized(true);
            };
            fetchFamilyData();
        } else {
            setIsInitialized(true);
        }
    }, [familyId]);

    useEffect(() => {
        if (familyId) {
            localStorage.setItem('sop_family_id', familyId);

            // Subscribe to Supabase
            const channel = supabase
                .channel('family-updates')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'families',
                        filter: `id=eq.${familyId}`,
                    },
                    (payload) => {
                        if (payload.new) {
                            if (payload.new.kids) {
                                let newKids = payload.new.kids;
                                if (typeof newKids === 'string') {
                                    try {
                                        newKids = JSON.parse(newKids);
                                    } catch (e) {
                                        console.error("Failed to parse kids JSON", e);
                                        newKids = [];
                                    }
                                }
                                setKids(newKids);
                            }
                            // Sync PIN if it changes remotely
                            if (payload.new.pin !== undefined) {
                                setPin(payload.new.pin);
                            }
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            localStorage.removeItem('sop_family_id');
        }
    }, [familyId]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setAppPin = (newPin) => {
        setPin(newPin);
    };

    const createFamily = async () => {
        const newFamilyId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error } = await supabase
            .from('families')
            .insert([
                {
                    id: newFamilyId,
                    kids: kids,
                    pin: pin // Save current PIN to DB
                }
            ]);

        if (error) {
            console.error("Error creating family:", error);
            alert("Erreur lors de la création de la famille: " + error.message);
            return null;
        }

        setFamilyId(newFamilyId);
        setIsInitialized(true);
        return newFamilyId;
    };

    const joinFamily = async (id) => {
        const { data, error } = await supabase
            .from('families')
            .select('*')
            .eq('id', id)
            .single();

        if (data) {
            setFamilyId(id);
            if (data.kids) {
                let loadedKids = data.kids;
                if (typeof loadedKids === 'string') {
                    try {
                        loadedKids = JSON.parse(loadedKids);
                    } catch (e) {
                        console.error("Failed to parse kids JSON", e);
                        loadedKids = [];
                    }
                }
                if (Array.isArray(loadedKids)) {
                    setKids(loadedKids);
                } else {
                    console.error("ERREUR: Les données reçues ne sont pas une liste valide.");
                }
            }
            if (data.pin) setPin(data.pin); // Load PIN from DB
            setIsInitialized(true);
            return true;
        }
        if (error) {
            console.error("Error joining family:", error);
        }
        return false;
    };

    useEffect(() => {
        if (!familyId) { // Only save to local if not syncing
            localStorage.setItem('sop_kids', JSON.stringify(kids));
        } else {
            // If syncing, update Supabase whenever kids change
            // ONLY if initialized to avoid overwriting with empty state on load
            if (isInitialized) {
                supabase
                    .from('families')
                    .update({ kids: kids })
                    .eq('id', familyId)
                    .then(({ error }) => {
                        if (error) console.error("Sync error", error);
                    });
            }
        }
    }, [kids, familyId, isInitialized]);

    // New Effect to sync PIN changes
    useEffect(() => {
        if (pin) {
            localStorage.setItem('sop_pin', pin);
        } else {
            localStorage.removeItem('sop_pin');
        }

        if (familyId && isInitialized) {
            supabase
                .from('families')
                .update({ pin: pin })
                .eq('id', familyId)
                .then(({ error }) => {
                    if (error) console.error("Sync PIN error", error);
                });
        }
    }, [pin, familyId, isInitialized]);

    useEffect(() => {
        localStorage.setItem('sop_actions', JSON.stringify(actions));
    }, [actions]);

    useEffect(() => {
        localStorage.setItem('sop_logs', JSON.stringify(logs));
    }, [logs]);

    const addChild = (name, image = null) => {
        const newKid = {
            id: Date.now().toString(),
            name,
            avatar: image, // Store Base64 image
            score: 10, // Start at 10
            history: [], // Initialize history
        };
        setKids([...kids, newKid]);
    };

    const removeChild = (id) => {
        setKids(kids.filter(k => k.id !== id));
    };

    const validateWeek = (childId) => {
        setKids(kids.map(kid => {
            if (kid.id === childId) {
                const history = kid.history || [];
                const newEntry = {
                    date: new Date().toLocaleDateString('fr-FR'), // Format: DD/MM/YYYY
                    score: kid.score
                };
                return { ...kid, score: 10, history: [...history, newEntry] }; // Reset score to 10 and save history
            }
            return kid;
        }));

        // Clear logs for this child (start fresh for new week)
        setLogs(logs.filter(l => l.childId !== childId));
    };

    const addAction = (label, type, value) => {
        const newAction = {
            id: Date.now().toString(),
            label,
            type,
            value: parseFloat(value),
        };
        setActions([...actions, newAction]);
    };

    const logAction = (childId, actionId) => {
        const action = actions.find(a => a.id === actionId);
        if (!action) return;

        const newLog = {
            id: Date.now().toString(),
            childId,
            actionId,
            date: new Date().toISOString(),
            value: action.value
        };
        setLogs([...logs, newLog]);

        // Update child score
        setKids(kids.map(kid => {
            if (kid.id === childId) {
                let newScore = kid.score + action.value;
                if (newScore < 0) newScore = 0;   // Floor at 0
                return { ...kid, score: newScore };
            }
            return kid;
        }));
    };

    const resetScores = () => {
        setKids(kids.map(kid => ({ ...kid, score: 10 })));
        setLogs([]);
    };

    return (
        <DataContext.Provider value={{
            kids,
            actions,
            logs,
            addChild,
            removeChild,
            validateWeek,
            addAction,
            logAction,
            logAction,
            resetScores,
            theme,
            toggleTheme,
            pin,
            setAppPin,
            familyId,
            createFamily,
            joinFamily
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
