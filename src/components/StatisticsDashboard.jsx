// Ultimate Design v3.0 - Brand Colors Integrated
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StatisticsDashboard = ({ isOpen, onClose, logs = [], actions = [] }) => {
    if (!isOpen) return null;
    if (!logs || !actions) return null;

    // --- LOGIC ---
    const getCategoryLabel = (id) => {
        if (id.startsWith('sc')) return 'ÉCOLE & DEVOIRS';
        if (id.startsWith('hm')) return 'MAISON & CHAMBRE';
        if (id.startsWith('bh')) return 'COMPORTEMENT';
        if (id.startsWith('hy')) return 'HYGIÈNE';
        if (id.startsWith('tb')) return 'REPAS & TABLE';
        if (id.startsWith('sl')) return 'SOMMEIL & ÉCRANS';
        return 'AUTRES';
    };

    let goodCount = 0;
    let badCount = 0;
    const categoryCounts = {};

    logs.forEach(log => {
        const action = actions.find(a => a.id === log.actionId);
        if (action) {
            if (action.value > 0) goodCount++;
            else badCount++;
            const cat = getCategoryLabel(action.id);
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    });

    const categoryData = Object.keys(categoryCounts).map(cat => ({
        name: cat,
        value: categoryCounts[cat]
    })).sort((a, b) => b.value - a.value);

    // --- BRAND PALETTE ---
    const APP_GOOD = '#34c759'; // Green from index.css
    const APP_BAD = '#ff3b30';  // Red from index.css

    // Custom Palette based on App Accents (Terracotta, Menthe, Lagune)
    const BRAND_COLORS = [
        '#E39774', // Terracotta (Accent)
        '#96C7B3', // Menthe (Dark Mode Accent)
        '#6398A9', // Lagune (Subtext)
        '#D7897F', // Accent Hover
        '#34c759', // Good Green
        '#ff3b30', // Bad Red
        '#F4A261'  // Sandy Orange (Complimentary)
    ];

    // --- SVG GAUGE COMPONENT (Pure CSS/SVG for crisp look) ---
    const GaugeChart = () => {
        const total = goodCount + badCount;
        const radius = 80;
        const circumference = Math.PI * radius; // Half circle (pi * r)

        // Calculate stroke-dasharray
        // Total arc is 180deg.
        // Good segment logic:
        const goodRatio = total === 0 ? 0 : goodCount / total;
        // The stroke-dasharray for the "Good" path needs to match its portion of the arc.
        // We will render two overlaid arcs.
        // 1. Full Red Arc (Background for Bad)
        // 2. Green Arc (Overlay for Good)

        return (
            <div style={{ position: 'relative', width: '220px', height: '110px', margin: '0 auto', overflow: 'hidden' }}>
                <svg width="220" height="110" viewBox="0 0 220 110">
                    {/* Definitions for gradient */}
                    <defs>
                        <linearGradient id="goodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#34c759" />
                            <stop offset="100%" stopColor="#2db54e" />
                        </linearGradient>
                        <linearGradient id="badGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff3b30" />
                            <stop offset="100%" stopColor="#d32f2f" />
                        </linearGradient>
                    </defs>

                    {/* Background Track (Empty) */}
                    <path
                        d="M 20 100 A 90 90 0 0 1 200 100"
                        fill="none"
                        stroke="var(--border-color)"
                        strokeWidth="15"
                        strokeLinecap="round"
                    />

                    {/* Bad Segment (Red) - Fills the whole bar initially */}
                    {total > 0 && (
                        <path
                            d="M 20 100 A 90 90 0 0 1 200 100"
                            fill="none"
                            stroke="url(#badGradient)"
                            strokeWidth="15"
                            strokeLinecap="round"
                        />
                    )}

                    {/* Good Segment (Green) - Masks the Red */}
                    {goodCount > 0 && (
                        <path
                            d="M 20 100 A 90 90 0 0 1 200 100"
                            fill="none"
                            stroke="url(#goodGradient)"
                            strokeWidth="15"
                            strokeLinecap="round"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={circumference * (1 - goodRatio)}
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                    )}
                </svg>

                {/* Score Text */}
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)', lineHeight: 1 }}>
                        {goodCount}/{total}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--subtext-color)', textTransform: 'uppercase' }}>
                        Actions
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'var(--modal-overlay)', zIndex: 9999 }}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '500px',
                    width: '95%',
                    background: 'var(--modal-bg)',
                    borderRadius: '40px',
                    padding: '0',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '85vh',
                    color: 'var(--text-color)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '2rem 2rem 1rem', textAlign: 'center' }}>
                    <div style={{
                        margin: '0 auto 1.5rem',
                        width: '70px',
                        height: '70px',
                        borderRadius: '24px',
                        background: 'var(--btn-bg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px var(--shadow-color)',
                        fontSize: '2.5rem'
                    }}>
                        📊
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--header-text)' }}>Statistiques</h2>
                </div>

                {/* Scrollable Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 2rem 2rem' }}>

                    {logs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--subtext-color)' }}>
                            <p>Ajoute des actions pour voir les stats !</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Card 1: Score Gauge */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'var(--card-bg)',
                                borderRadius: '28px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 2px 10px var(--shadow-color)'
                            }}>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: '700', color: 'var(--subtext-color)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Ratio de la semaine
                                </h3>

                                {/* Custom SVG Gauge */}
                                <GaugeChart />

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: APP_GOOD }}></div>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Bonnes</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: APP_BAD }}></div>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Bêtises</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Categories Donut */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'var(--card-bg)',
                                borderRadius: '28px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 2px 10px var(--shadow-color)'
                            }}>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: '700', color: 'var(--subtext-color)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Répartition
                                </h3>
                                <div style={{ height: '240px', marginLeft: '-10px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                                cornerRadius={6}
                                                stroke="var(--card-bg)"
                                                strokeWidth={2}
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Legend
                                                layout="vertical"
                                                verticalAlign="middle"
                                                align="right"
                                                iconType="circle"
                                                iconSize={10}
                                                formatter={(value) => <span style={{ color: 'var(--text-color)', fontWeight: '500', fontSize: '0.85rem' }}>{value}</span>}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                                    background: 'var(--card-bg)',
                                                    color: 'var(--text-color)'
                                                }}
                                                itemStyle={{ color: 'var(--text-color)', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer Button - Mobile Safe Area Fixed */}
                <div style={{
                    padding: '1.5rem 2rem calc(1.5rem + env(safe-area-inset-bottom)) 2rem',
                    background: 'var(--card-bg)',
                    borderTop: '1px solid var(--border-color)',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '18px', // Taller touch target
                            background: 'var(--header-text)',
                            color: 'var(--bg-color)',
                            border: 'none',
                            borderRadius: '24px', // More rounded
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px var(--shadow-color)',
                            transition: 'transform 0.1s active',
                            marginBottom: '10px' // Extra margin from bottom edge
                        }}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatisticsDashboard;
