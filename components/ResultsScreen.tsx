
import React from 'react';
import type { ExamResult } from '../types';
import Button from './Button';

interface ResultsScreenProps {
  result: ExamResult;
  onStartNew: () => void;
  onViewHistory: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onStartNew, onViewHistory }) => {
  const isPass = result.percentage >= 50;

  return (
    <div className="text-center p-8 bg-slate-800 rounded-xl shadow-2xl animate-fade-in">
      <h2 className="text-4xl font-bold mb-4">{isPass ? 'Congratulations!' : 'Keep Trying!'}</h2>
      <p className="text-slate-400 mb-6">You have completed the exam.</p>

      <div className="my-8">
        <div className={`relative inline-flex items-center justify-center w-48 h-48`}>
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                    className="text-slate-700"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="2"
                />
                <path
                    className={isPass ? 'text-green-500' : 'text-red-500'}
                    strokeDasharray={`${result.percentage}, 100`}
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                 <span className="text-4xl font-bold text-white">{result.percentage}%</span>
                 <span className="text-slate-300">Score: {result.score}/{result.total}</span>
            </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={onStartNew} variant="primary">Start New Exam</Button>
        <Button onClick={onViewHistory} variant="secondary">View History</Button>
      </div>
    </div>
  );
};

export default ResultsScreen;
