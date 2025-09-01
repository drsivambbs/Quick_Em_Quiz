
import React, { useState, useEffect, useCallback } from 'react';
import type { Question, ExamResult } from './types';
import { View } from './types';
import { getQuestions } from './services/questionService';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import LoadingScreen from './components/LoadingScreen';
import ExamScreen from './components/ExamScreen';
import ResultsScreen from './components/ResultsScreen';
import HistoryScreen from './components/HistoryScreen';

const EXAM_QUESTION_COUNT = 100;

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Home);
  const [currentExamQuestions, setCurrentExamQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Map<number, number>>(new Map());
  const [examHistory, setExamHistory] = useLocalStorage<ExamResult[]>('examHistory', []);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);

  const prepareExam = useCallback(async () => {
    const questions = await getQuestions(EXAM_QUESTION_COUNT);
    setCurrentExamQuestions(questions);
    setUserAnswers(new Map());
    setCurrentResult(null);
    setView(View.Exam);
  }, []);

  useEffect(() => {
    if (view === View.Loading) {
      prepareExam();
    }
  }, [view, prepareExam]);

  const handleCreateExam = () => {
    setView(View.Loading);
  };

  const handleAnswerSelect = (questionNo: number, option: number) => {
    setUserAnswers(prevAnswers => new Map(prevAnswers).set(questionNo, option));
  };
  
  const handleSubmitExam = () => {
    let score = 0;
    currentExamQuestions.forEach(question => {
      if (userAnswers.get(question.QuestionNo) === question.CorrectOption) {
        score++;
      }
    });
    
    const percentage = (score / currentExamQuestions.length) * 100;
    const newResult: ExamResult = {
      id: Date.now(),
      date: new Date().toISOString(),
      total: currentExamQuestions.length,
      score,
      percentage: parseFloat(percentage.toFixed(2)),
    };

    setCurrentResult(newResult);
    setExamHistory(prevHistory => [newResult, ...prevHistory]);
    setView(View.Results);
  };
  
  const handleStartNewExam = () => {
    setView(View.Home);
  };

  const handleSwitchView = (newView: View) => {
    setView(newView);
  }

  const renderContent = () => {
    switch (view) {
      case View.Home:
        return <HomeScreen onCreateExam={handleCreateExam} />;
      case View.Loading:
        return <LoadingScreen />;
      case View.Exam:
        return (
          <ExamScreen 
            questions={currentExamQuestions}
            answers={userAnswers}
            onAnswer={handleAnswerSelect}
            onSubmit={handleSubmitExam}
          />
        );
      case View.Results:
        return currentResult && (
          <ResultsScreen 
            result={currentResult}
            onStartNew={handleStartNewExam}
            onViewHistory={() => handleSwitchView(View.History)}
          />
        );
      case View.History:
        return <HistoryScreen history={examHistory} />;
      default:
        return <HomeScreen onCreateExam={handleCreateExam} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Header 
          currentView={view}
          onSwitchView={handleSwitchView}
        />
        <main className="mt-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
