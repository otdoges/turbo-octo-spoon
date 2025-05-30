import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', transformations: 4 },
  { name: 'Feb', transformations: 7 },
  { name: 'Mar', transformations: 12 },
  { name: 'Apr', transformations: 15 },
  { name: 'May', transformations: 10 },
  { name: 'Jun', transformations: 18 },
];

const Analytics = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold mb-6">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-2">Total Transformations</h3>
          <p className="text-3xl font-display font-bold">66</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-2">Active Sites</h3>
          <p className="text-3xl font-display font-bold">12</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-2">Avg. Improvement Score</h3>
          <p className="text-3xl font-display font-bold">85%</p>
        </div>
      </div>
      
      <div className="card" style={{ height: '400px' }}>
        <h3 className="text-lg font-display font-bold mb-4">Transformation History</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="name" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="transformations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;