import type { Question } from '../types';
import { questions as defaultQuestions } from '../data/questions';

// Fisher-Yates (aka Knuth) Shuffle algorithm
function shuffleArray<T,>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const getCustomQuestions = (): Question[] | null => {
    try {
        const customQuestionsJSON = localStorage.getItem('customQuestions');
        if (customQuestionsJSON) {
            const parsed = JSON.parse(customQuestionsJSON);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
        return null;
    } catch (error) {
        console.error("Failed to load custom questions from localStorage", error);
        return null;
    }
};

export const getQuestionBank = (): Question[] => {
    return getCustomQuestions() || defaultQuestions;
};

export const saveQuestionBank = (questions: Question[]): void => {
    try {
        localStorage.setItem('customQuestions', JSON.stringify(questions));
    } catch (error) {
        console.error("Failed to save custom questions to localStorage", error);
    }
};


export const getQuestions = (count: number): Promise<Question[]> => {
  return new Promise(resolve => {
    // Simulate network delay
    setTimeout(() => {
      const allQuestions = getQuestionBank();
      const shuffled = shuffleArray(allQuestions);
      const selectedQuestions = shuffled.slice(0, Math.min(count, allQuestions.length));
      resolve(selectedQuestions);
    }, 2000); // 2-second delay to simulate loading
  });
};

export const getQuestionCount = (): number => {
    return getQuestionBank().length;
}