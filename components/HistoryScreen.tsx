
import React from 'react';
import type { ExamResult } from '../types';

interface HistoryScreenProps {
  history: ExamResult[];
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-xl">
        <h2 className="text-2xl font-bold text-slate-300">No Exam History</h2>
        <p className="mt-2 text-slate-400">Complete an exam to see your results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-center mb-6">Exam History</h2>
      {history.map((result) => (
        <div key={result.id} className="bg-slate-800 p-5 rounded-lg shadow-lg flex items-center justify-between transition-transform hover:scale-105">
          <div>
            <p className="font-semibold text-indigo-400">{new Date(result.date).toLocaleString()}</p>
            <p className="text-slate-400 text-sm">Total Questions: {result.total}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white">Score: {result.score} / {result.total}</p>
            <p className={`text-2xl font-extrabold ${result.percentage >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {result.percentage}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryScreen;
