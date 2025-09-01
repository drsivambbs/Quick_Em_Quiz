
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800 rounded-xl shadow-2xl">
      <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
      <h2 className="mt-6 text-2xl font-semibold text-slate-200">Preparing Your Exam...</h2>
      <p className="mt-2 text-slate-400">Randomly selecting questions just for you.</p>
    </div>
  );
};

export default LoadingScreen;
