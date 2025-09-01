
import React, { useState } from 'react';
import type { Question } from '../types';
import Button from './Button';
import ProgressBar from './ProgressBar';

interface ExamScreenProps {
  questions: Question[];
  answers: Map<number, number>;
  onAnswer: (questionNo: number, option: number) => void;
  onSubmit: () => void;
}

const Option: React.FC<{
  optionText: string;
  isSelected: boolean;
  onClick: () => void;
  isCorrect?: boolean;
}> = ({ optionText, isSelected, onClick }) => {
  const baseStyle = "w-full text-left p-4 my-2 border-2 rounded-lg transition-all cursor-pointer";
  const selectedStyle = "bg-indigo-500 border-indigo-400 shadow-lg scale-105";
  const unselectedStyle = "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500";

  return (
    <button onClick={onClick} className={`${baseStyle} ${isSelected ? selectedStyle : unselectedStyle}`}>
      {optionText}
    </button>
  );
};


const ExamScreen: React.FC<ExamScreenProps> = ({ questions, answers, onAnswer, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = answers.size;

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isAllAnswered = answeredCount === totalQuestions;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl animate-fade-in">
      <ProgressBar current={answeredCount} total={totalQuestions} />
      
      <div className="my-6 text-center">
        <p className="text-slate-400">Question {currentIndex + 1} of {totalQuestions}</p>
        <h2 className="text-2xl font-semibold mt-2">{currentQuestion.Question}</h2>
      </div>

      <div className="flex flex-col items-center">
        {[1, 2, 3, 4].map((optionIndex) => {
          const optionKey = `Option${optionIndex}` as keyof Question;
          return (
            <Option
              key={optionIndex}
              optionText={currentQuestion[optionKey] as string}
              isSelected={answers.get(currentQuestion.QuestionNo) === optionIndex}
              onClick={() => onAnswer(currentQuestion.QuestionNo, optionIndex)}
            />
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={handlePrev} disabled={currentIndex === 0} variant="secondary">
          Previous
        </Button>
        {currentIndex === totalQuestions - 1 ? (
          <Button onClick={onSubmit} disabled={!isAllAnswered} title={!isAllAnswered ? 'Please answer all questions' : ''}>
            Submit Exam
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={currentIndex === totalQuestions - 1}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamScreen;
