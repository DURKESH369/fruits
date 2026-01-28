
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Nutrients } from '../types';

interface Props {
  nutrients: Nutrients;
}

const NutritionChart: React.FC<Props> = ({ nutrients }) => {
  const data = [
    { name: 'Calories (kcal)', value: nutrients.calories, color: '#f59e0b' },
    { name: 'Sugar (g)', value: nutrients.sugar, color: '#ef4444' },
    { name: 'Fiber (g)', value: nutrients.fiber, color: '#10b981' },
    { name: 'Protein (g)', value: nutrients.protein, color: '#3b82f6' },
    { name: 'Carbs (g)', value: nutrients.carbs, color: '#6366f1' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
          <Tooltip 
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutritionChart;
