
import React from 'react';
import Button from './Button';

interface HomeScreenProps {
  onCreateExam: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onCreateExam }) => {
  return (
    <div className="text-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-4xl font-extrabold text-white mb-2">Welcome to QuickQuiz</h2>
      <p className="text-lg text-slate-400 mb-8">
        Test your knowledge with our randomly generated exams.
      </p>
      <p className="text-slate-300 mb-2">You'll be presented with 100 questions.</p>
      <p className="text-slate-300 mb-8">Click the button below when you're ready to begin.</p>
      <Button onClick={onCreateExam} className="text-xl w-full sm:w-auto">
        Create New Exam
      </Button>
    </div>
  );
};

export default HomeScreen;
