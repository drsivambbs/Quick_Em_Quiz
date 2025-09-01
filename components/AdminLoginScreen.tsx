import React, { useState } from 'react';
import Button from './Button';

interface AdminLoginScreenProps {
  onLogin: (password: string) => void;
  error: string | null;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin') {
      onLogin(password);
    } else {
       onLogin(''); // Trigger error for wrong username
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl shadow-2xl animate-fade-in max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block mb-2 text-sm font-medium text-slate-300">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <Button type="submit" className="w-full">Login</Button>
      </form>
    </div>
  );
};

export default AdminLoginScreen;
