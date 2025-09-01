
import type { Question } from '../types';
import { questions as allQuestions } from '../data/questions';

// Fisher-Yates (aka Knuth) Shuffle algorithm
function shuffleArray<T,>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const getQuestions = (count: number): Promise<Question[]> => {
  return new Promise(resolve => {
    // Simulate network delay
    setTimeout(() => {
      const shuffled = shuffleArray(allQuestions);
      const selectedQuestions = shuffled.slice(0, Math.min(count, allQuestions.length));
      resolve(selectedQuestions);
    }, 2000); // 2-second delay to simulate loading
  });
};
