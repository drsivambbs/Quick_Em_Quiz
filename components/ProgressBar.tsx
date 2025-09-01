
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-slate-300">Progress</span>
        <span className="text-sm font-medium text-slate-300">{current} / {total} Answered</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
