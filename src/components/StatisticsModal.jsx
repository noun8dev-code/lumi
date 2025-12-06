// Premium Design v1.0 - Verified
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StatisticsModal = ({ isOpen, onClose, logs, actions }) => {
    if (!isOpen) return null;

    // Helper: Category Logic (Duplicated for now, ideal to refactor later)
    const getCategoryLabel = (id) => {
        if (id.startsWith('sc')) return 'ÉCOLE & DEVOIRS';
        if (id.startsWith('hm')) return 'MAISON & CHAMBRE';
        if (id.startsWith('bh')) return 'COMPORTEMENT';
        if (id.startsWith('hy')) return 'HYGIÈNE';
        if (id.startsWith('tb')) return 'REPAS & TABLE';
        if (id.startsWith('sl')) return 'SOMMEIL & ÉCRANS';
        return 'AUTRES';
    };

    // 1. Prepare Data: Good vs Bad
    let goodCount = 0;
    let badCount = 0;

    // 2. Prepare Data: Categories
    const categoryCounts = {};

    logs.forEach(log => {
        const action = actions.find(a => a.id === log.actionId);
        if (action) {
            // Good vs Bad
            if (action.value > 0) goodCount++;
            else badCount++;

            // Category
            const cat = getCategoryLabel(action.id);
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    });

    const goodBadData = [
        { name: 'Bonnes Actions', value: goodCount, color: '#4caf50' },
        { name: 'Bêtises', value: badCount, color: '#f44336' }
    ].filter(d => d.value > 0);

    const categoryData = Object.keys(categoryCounts).map(cat => ({
        name: cat,
        value: categoryCounts[cat]
    })).sort((a, b) => b.value - a.value); // Sort max to min

    // Colors for categories
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.4)' }}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '600px',
                    width: '90%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    borderRadius: '32px',
                    padding: '2.5rem'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '1.8rem',
                        marginBottom: '1rem',
                        boxShadow: '0 10px 20px rgba(0, 13, 255, 0.3)'
                    }}>
                        📊
                    </div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '2rem',
                        fontWeight: '800',
                        background: 'linear-gradient(90deg, #1c1c1e 0%, #3a3a3c 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Statistiques
                    </h2>
                    <p style={{ color: '#888', margin: '5px 0 0 0', fontWeight: '500' }}>Analyse des comportements</p>
                </div>

                {logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#86868b', background: '#f5f5f7', borderRadius: '24px' }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Pas encore assez de données 🐣</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Commencez à ajouter des actions pour voir les graphiques !</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Chart 1: Good vs Bad */}
                        <div style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '24px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(0,0,0,0.02)'
                        }}>
                            <h3 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '700', color: '#1c1c1e' }}>Bilan Global</h3>
                            <div style={{ height: '260px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={goodBadData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                            cornerRadius={8}
                                        >
                                            {goodBadData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                                fontWeight: '600'
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Categories */}
                        <div style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '24px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(0,0,0,0.02)'
                        }}>
                            <h3 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '700', color: '#1c1c1e' }}>Par Catégorie</h3>
                            <div style={{ height: '260px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            innerRadius={40}
                                            dataKey="value"
                                            paddingAngle={2}
                                            cornerRadius={4}
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                                if (percent < 0.1) return null;
                                                const RADIAN = Math.PI / 180;
                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                return (
                                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                                        {`${(percent * 100).toFixed(0)}%`}
                                                    </text>
                                                );
                                            }}
                                            labelLine={false}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                                fontWeight: '600'
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                )}

                <button
                    className="close-modal"
                    onClick={onClose}
                    style={{
                        marginTop: '2.5rem',
                        width: '100%',
                        padding: '18px',
                        background: '#1c1c1e',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        border: 'none',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default StatisticsModal;
