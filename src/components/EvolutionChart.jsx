import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EvolutionChart = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#86868b', background: '#f5f5f7', borderRadius: '16px' }}>
                Pas encore de données historiques. Validez une semaine pour voir l'évolution !
            </div>
        );
    }

    // Prepare data
    const data = history.map((entry, index) => ({
        name: entry.date,
        score: entry.score
    }));

    return (
        <div style={{ width: '100%', height: 300, background: 'var(--card-bg)', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px var(--shadow-color)' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-color)' }}>Évolution du Score</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: -20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#86868b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 'auto']}
                        tick={{ fontSize: 12, fill: '#86868b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#0071e3"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#0071e3', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EvolutionChart;
