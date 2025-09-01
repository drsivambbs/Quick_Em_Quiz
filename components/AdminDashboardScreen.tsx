import React, { useState } from 'react';
import type { Question } from '../types';
import Button from './Button';

interface AdminDashboardScreenProps {
  onLogout: () => void;
  onUpload: (questions: Question[]) => void;
  initialQuestionCount: number;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onLogout, onUpload, initialQuestionCount }) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [questionCount, setQuestionCount] = useState(initialQuestionCount);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const validateQuestions = (data: any): data is Question[] => {
    if (!Array.isArray(data)) return false;
    return data.every(q => 
        typeof q.QuestionNo === 'number' &&
        typeof q.Question === 'string' &&
        typeof q.Option1 === 'string' &&
        typeof q.Option2 === 'string' &&
        typeof q.Option3 === 'string' &&
        typeof q.Option4 === 'string' &&
        typeof q.CorrectOption === 'number'
    );
  }

  const handleUpload = () => {
    if (!file) {
      setMessage('Please select a file first.');
      setMessageType('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Could not read file content.");
        
        const jsonData = JSON.parse(text);

        if (validateQuestions(jsonData)) {
          onUpload(jsonData);
          setQuestionCount(jsonData.length);
          setMessage(`Successfully uploaded ${jsonData.length} questions.`);
          setMessageType('success');
          setFile(null);
          const fileInput = document.getElementById('question-file') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

        } else {
          throw new Error("Invalid JSON structure. Ensure it's an array of questions with the correct fields.");
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to parse or validate JSON file.");
        setMessageType('error');
      }
    };
    reader.onerror = () => {
        setMessage('Error reading file.');
        setMessageType('error');
    }
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl shadow-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Button onClick={onLogout} variant="secondary">Logout</Button>
      </div>

      <div className="bg-slate-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Manage Question Bank</h3>
        <p className="text-slate-400 mb-4">
          Current number of questions: <span className="font-bold text-indigo-400">{questionCount}</span>
        </p>
        <p className="text-slate-400 mb-4">
          Upload a new JSON file to replace the entire question bank. The file must be an array of question objects in the correct format.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            id="question-file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <Button onClick={handleUpload} disabled={!file} className="w-full sm:w-auto">
            Upload & Replace
          </Button>
        </div>

        {message && (
          <p className={`mt-4 text-center text-sm ${messageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardScreen;
