import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { StorageService } from '../utils/storage';
import { COMPREHENSIVE_ACTIONS } from '../data/actions';

const DataContext = createContext();

const INITIAL_ACTIONS = COMPREHENSIVE_ACTIONS;

export const DataProvider = ({ children }) => {
    // 1. Initialize State with defaults (no synchronous localStorage access)
    const [kids, setKids] = useState([]);
    const [actions, setActions] = useState(INITIAL_ACTIONS);
    const [logs, setLogs] = useState([]);
    const [theme, setTheme] = useState('light');
    const [pin, setPin] = useState(null);
    const [familyId, setFamilyId] = useState(null);
    const [user, setUser] = useState(null);

    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // New loading state

    // Refs for safe access in effects/closures
    const kidsRef = useRef(kids);
    const pinRef = useRef(pin);

    useEffect(() => { kidsRef.current = kids; }, [kids]);
    useEffect(() => { pinRef.current = pin; }, [pin]);

    // 2. Initial Data Loading (Async)
    useEffect(() => {
        const initData = async () => {
            try {
                // Load critical preferences first
                const savedTheme = await StorageService.get('sop_theme');
                if (savedTheme) {
                    setTheme(savedTheme);
                    document.body.setAttribute('data-theme', savedTheme);
                }

                const savedPin = await StorageService.get('sop_pin');
                if (savedPin) setPin(savedPin);

                const savedActions = await StorageService.get('sop_actions');
                if (savedActions) setActions(savedActions);

                // Auth Check
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);

                if (session?.user) {
                    setFamilyId(session.user.id);
                    // Data will be loaded by the 'user' dependency effect below
                } else {
                    // Guest Mode: Load local data
                    const savedKids = await StorageService.get('sop_kids');
                    if (savedKids) setKids(savedKids);

                    const savedLogs = await StorageService.get('sop_logs');
                    if (savedLogs) setLogs(savedLogs);
                }
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        initData();
    }, []);

    // 3. Auth Listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user;
            setUser(currentUser ?? null);

            if (currentUser) {
                setFamilyId(currentUser.id);
            } else {
                setFamilyId(null);
                // Switched to guest: Try to reload local kids if not already loaded?
                // For simplicity, we assume initData handled initial load, 
                // but if logout happens, we might want to reload local storage or clear?
                // Usually logout = clear sensitive data, but here "local" is "guest data".
                const savedKids = await StorageService.get('sop_kids');
                setKids(savedKids || []);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 4. Data Sync/Load Logic (Cloud vs Local)
    useEffect(() => {
        const loadCloudData = async () => {
            if (user && familyId) {
                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('families')
                    .select('*')
                    .eq('id', familyId)
                    .single();

                if (data) {
                    if (data.kids) {
                        let loadedKids = data.kids;
                        if (typeof loadedKids === 'string') {
                            try { loadedKids = JSON.parse(loadedKids); } catch { loadedKids = []; }
                        }
                        setKids(Array.isArray(loadedKids) ? loadedKids : []);
                    }
                    if (data.pin) setPin(data.pin);
                } else if (!error || error.code === 'PGRST116') {
                    // New user or empty DB: Init with local data if valuable?
                    // Or starts empty. 
                    // Current logic: Upsert current 'kidsRef' to DB if DB is empty
                    // But we might be empty state here.
                    // safely insert if we have local content we want to push?
                    // For now, let's just stick to "Load DB". 
                }
            }
        };

        if (isInitialized && user) {
            loadCloudData();
        }
    }, [user, familyId, isInitialized]);


    // 5. Persistence Effects
    useEffect(() => {
        if (!isInitialized || isLoading) return;

        if (user && familyId) {
            // Cloud Sync
            supabase
                .from('families')
                .upsert({ id: familyId, kids: kids, pin: pin })
                .then(({ error }) => {
                    if (error) console.error("Sync error:", error);
                });
        } else {
            // Local Sync (Guest)
            StorageService.set('sop_kids', kids);
            if (pin) StorageService.set('sop_pin', pin);
            else StorageService.remove('sop_pin');
        }
    }, [kids, pin, familyId, user, isInitialized, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            StorageService.set('sop_actions', actions);
        }
    }, [actions, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            StorageService.set('sop_logs', logs);
        }
    }, [logs, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            StorageService.set('sop_theme', theme);
            document.body.setAttribute('data-theme', theme);
        }
    }, [theme, isLoading]);


    // Real-time Subscription (Only if logged in)
    useEffect(() => {
        if (!user || !familyId) return;

        const channel = supabase
            .channel('family-updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'families', filter: `id=eq.${familyId}` },
                (payload) => {
                    if (payload.new && payload.new.kids) {
                        let newKids = payload.new.kids;
                        if (typeof newKids === 'string') try { newKids = JSON.parse(newKids); } catch { }
                        // Simple replace for now
                        // setKids(newKids); 
                        // Note: This might conflict with local typing, implement merge strategy if needed
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [familyId, user]);


    // Actions
    const logout = async () => {
        await supabase.auth.signOut();
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
            .insert([{ id: newFamilyId, kids: kids, pin: pin }]);

        if (error) {
            alert("Erreur: " + error.message);
            return null;
        }

        setFamilyId(newFamilyId);
        return newFamilyId;
    };

    const joinFamily = async (id) => {
        const { data } = await supabase.from('families').select('*').eq('id', id).single();
        if (data) {
            setFamilyId(id);
            // Data load will happen via effect
            return true;
        }
        return false;
    };

    const addChild = (name, image = null) => {
        const newKid = {
            id: Date.now().toString(),
            name,
            avatar: image,
            score: 10,
            history: [],
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
                const newEntry = { date: new Date().toLocaleDateString('fr-FR'), score: kid.score };
                return { ...kid, score: 10, history: [...history, newEntry] };
            }
            return kid;
        }));
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

        setKids(kids.map(kid => {
            if (kid.id === childId) {
                let newScore = kid.score + action.value;
                if (newScore < 0) newScore = 0;
                return { ...kid, score: newScore };
            }
            return kid;
        }));
    };

    const deleteLog = (logId) => {
        const logToDelete = logs.find(l => l.id === logId);
        if (!logToDelete) return;
        setLogs(logs.filter(l => l.id !== logId));
        setKids(kids.map(kid => {
            if (kid.id === logToDelete.childId) {
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

    // Render logic to prevent flash of empty content
    // if (isLoading) return <div>Chargement...</div>; 
    // ^ Maybe better to render children but with empty state? To avoid white screen?
    // User requested robust app: A loading screen is appropriate.
    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
                <div style={{ fontSize: '2rem' }}>chargement...</div>
            </div>
        );
    }

    return (
        <DataContext.Provider value={{
            kids, actions, logs, theme, pin, user, familyId,
            addChild, removeChild, validateWeek, addAction, deleteAction,
            logAction, deleteLog, resetScores, toggleTheme, setAppPin,
            logout, createFamily, joinFamily
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
