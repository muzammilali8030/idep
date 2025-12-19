import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { FinancialYear, StartupScores } from '../types';

interface FinancialChartProps {
  data: FinancialYear[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ScoreChartProps {
  scores: StartupScores;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ scores }) => {
  const data = [
    { subject: 'Market', A: scores.market, fullMark: 100 },
    { subject: 'Feasibility', A: scores.feasibility, fullMark: 100 },
    { subject: 'Finance', A: scores.financial, fullMark: 100 },
    { subject: 'Uniqueness', A: scores.uniqueness, fullMark: 100 },
    { subject: 'Team Effort', A: scores.teamRequirement, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Startup Score"
            dataKey="A"
            stroke="#6366f1"
            strokeWidth={2}
            fill="#818cf8"
            fillOpacity={0.4}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
