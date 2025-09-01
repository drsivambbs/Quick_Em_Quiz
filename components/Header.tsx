import React from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  onSwitchView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onSwitchView }) => {
  const TabButton: React.FC<{ view: View, targetView: View | View[], text: string }> = ({ view, targetView, text }) => {
    const isActive = Array.isArray(targetView) ? targetView.includes(view) : view === targetView;
    return (
      <button
        onClick={() => onSwitchView(Array.isArray(targetView) ? targetView[0] : targetView)}
        className={`px-4 py-2 text-lg font-semibold rounded-md transition-colors ${
          isActive ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-700'
        }`}
      >
        {text}
      </button>
    );
  };
  
  return (
    <header className="w-full flex justify-between items-center p-4 bg-slate-800 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-white tracking-wider">
        Quick<span className="text-indigo-400">Quiz</span>
      </h1>
      <nav className="flex space-x-2 bg-slate-700/50 p-1 rounded-lg">
        <TabButton view={currentView} targetView={[View.Home, View.Exam, View.Loading, View.Results]} text="Exam" />
        <TabButton view={currentView} targetView={View.History} text="History" />
        <TabButton view={currentView} targetView={[View.AdminLogin, View.AdminDashboard]} text="Admin" />
      </nav>
    </header>
  );
};

export default Header;
