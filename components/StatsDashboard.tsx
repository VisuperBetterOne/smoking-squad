
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SmokeHistory, User } from '../types';

interface StatsDashboardProps {
  history: SmokeHistory;
  users: User[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ history, users }) => {
  const chartData = Object.keys(history).sort().map(date => {
    const entry: any = { date: date.slice(5) }; // Short date MM-DD
    users.forEach(u => {
      entry[u.name] = history[date][u.id] || 0;
    });
    return entry;
  });

  return (
    <div className="glass-card rounded-2xl p-6 w-full overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <i className="fa-solid fa-chart-line text-blue-400"></i>
        戒菸戰報 (趨勢分析)
      </h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            {users.map(u => (
              <Line 
                key={u.id} 
                type="monotone" 
                dataKey={u.name} 
                stroke={u.color} 
                strokeWidth={3} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsDashboard;
