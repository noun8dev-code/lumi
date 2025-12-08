import { createContext, useState, useEffect, useContext, useRef } from 'react';
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
    const [user, setUser] = useState(null);

    // Refs to hold current state for "Start-up Sync" without triggering re-renders
    const kidsRef = useRef(kids);
    const pinRef = useRef(pin);

    useEffect(() => { kidsRef.current = kids; }, [kids]);
    useEffect(() => { pinRef.current = pin; }, [pin]);

    // Auth & Persistence Logic
    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                setFamilyId(session.user.id);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user;
            setUser(currentUser ?? null);

            if (currentUser) {
                setFamilyId(currentUser.id);
            } else {
                setFamilyId(null);
                setKids([]);
                setIsInitialized(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load data from LocalStorage (Guest) OR Supabase (User)
    useEffect(() => {
        const loadData = async () => {
            if (user && familyId) {
                // LOGGED IN: Fetch from Supabase
                const { data, error } = await supabase
                    .from('families')
                    .select('*')
                    .eq('id', familyId)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                    console.error("Error fetching family:", error);
                }

                if (data) {
                    if (data.kids) {
                        let loadedKids = data.kids;
                        if (typeof loadedKids === 'string') {
                            try { loadedKids = JSON.parse(loadedKids); } catch (e) { loadedKids = []; }
                        }
                        setKids(Array.isArray(loadedKids) ? loadedKids : []);
                    }
                    if (data.pin) setPin(data.pin);
                } else {
                    // New user (or empty DB): Upload LOCAL data to initialize DB
                    // This ensures "Connect to DB" saves current work
                    const initialKids = kidsRef.current || [];
                    const initialPin = pinRef.current;

                    await supabase
                        .from('families')
                        .insert([
                            {
                                id: familyId,
                                kids: initialKids,
                                pin: initialPin
                            }
                        ]);
                    // No need to setKids, we keep the local ones
                }
            }

            setIsInitialized(true);
        };

        loadData();
    }, [user, familyId]);

    // Update LocalStorage vs Supabase
    useEffect(() => {
        if (!isInitialized) return;

        if (user && familyId) {
            // Sync to Supabase
            supabase
                .from('families')
                .upsert({ id: familyId, kids: kids, pin: pin })
                .then(({ error }) => {
                    if (error) console.error("Sync error:", error);
                });
        } else {
            // Save to LocalStorage (Guest)
            localStorage.setItem('sop_kids', JSON.stringify(kids));
            if (pin) localStorage.setItem('sop_pin', pin);
            else localStorage.removeItem('sop_pin');
        }
    }, [kids, pin, familyId, user, isInitialized]);

    // Theme is local preference
    useEffect(() => {
        localStorage.setItem('sop_theme', theme);
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    // Real-time Subscription (Only if logged in)
    useEffect(() => {
        if (!user || !familyId) return;

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
                        // Merge logic could go here, for now just simplistic replace
                        if (payload.new.kids) {
                            let newKids = payload.new.kids;
                            if (typeof newKids === 'string') try { newKids = JSON.parse(newKids); } catch { }
                            // Only update if different to avoid loops? simplified:
                            // setKids(prev => JSON.stringify(prev) !== JSON.stringify(newKids) ? newKids : prev);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [familyId, user]);

    const logout = async () => {
        await supabase.auth.signOut();
        // State updates handled by onAuthStateChange
    };



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

    const deleteAction = (actionId) => {
        setActions(actions.filter(a => a.id !== actionId));
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

    const deleteLog = (logId) => {
        const logToDelete = logs.find(l => l.id === logId);
        if (!logToDelete) return;

        // 1. Remove from logs
        setLogs(logs.filter(l => l.id !== logId));

        // 2. Adjust child score (reverse the action value)
        setKids(kids.map(kid => {
            if (kid.id === logToDelete.childId) {
                // If it was a good action (+1), we remove it => -1
                // If it was a bad action (-1), we remove it => +1
                let newScore = kid.score - logToDelete.value;
                if (newScore < 0) newScore = 0;
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
            deleteAction,
            logAction,
            deleteLog,
            resetScores,
            theme,
            toggleTheme,
            pin,
            setAppPin,
            user,
            logout,
            familyId,
            createFamily,
            joinFamily
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
