import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                backdropFilter: 'blur(8px)',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#888', marginBottom: '4px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                    Score: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const EvolutionChart = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#86868b',
                background: 'var(--card-bg, #fff)',
                borderRadius: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <p style={{ fontSize: '1.1rem', margin: 0 }}>Pas encore de données historiques.</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '5px' }}>Validez une semaine pour voir l'évolution !</p>
            </div>
        );
    }

    // Prepare data
    const data = history.map((entry, index) => ({
        name: entry.date,
        score: entry.score
    }));

    return (
        <div style={{
            width: '100%',
            height: 350,
            background: 'var(--card-bg, #fff)',
            padding: '1.5rem',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
        }}>
            <h3 style={{
                textAlign: 'center',
                marginBottom: '1.5rem',
                color: 'var(--text-color)',
                fontSize: '1.2rem',
                fontWeight: '600'
            }}>
                📈 Évolution du Score
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#999' }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        domain={[0, 10]} // Assuming score is out of 10 usually
                        tick={{ fontSize: 11, fill: '#999' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent-color)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--accent-color)"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        animationDuration={1500}
                        dot={{ r: 4, fill: '#fff', stroke: 'var(--accent-color)', strokeWidth: 3 }}
                        activeDot={{ r: 7, fill: 'var(--accent-color)', stroke: '#fff', strokeWidth: 3 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EvolutionChart;
