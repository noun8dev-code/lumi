import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const DataContext = createContext();

import { COMPREHENSIVE_ACTIONS } from '../data/actions';

const INITIAL_ACTIONS = COMPREHENSIVE_ACTIONS;

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

    const addAction = (label, type, value, categoryPrefix = 'ot') => {
        const newAction = {
            id: `${categoryPrefix}_custom_${Date.now()}`,
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
