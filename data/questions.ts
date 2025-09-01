
import type { Question } from '../types';

export const questions: Question[] = [
  { "QuestionNo": 1, "Question": "The person connected with Navodaya schools is", "Option1": "Rajiv Gandhi", "Option2": "Vajpayee", "Option3": "Indira Gandhi", "Option4": "Narasimha Rao", "CorrectOption": 1 },
  { "QuestionNo": 2, "Question": "Which of the following is not connected with the education of gifted children?", "Option1": "Heterogenous grouping", "Option2": "Rapid promotion", "Option3": "Homogenous grouping", "Option4": "Enriched curriculum", "CorrectOption": 1 },
  { "QuestionNo": 3, "Question": "What is the capital of France?", "Option1": "Berlin", "Option2": "Madrid", "Option3": "Paris", "Option4": "Rome", "CorrectOption": 3 },
  { "QuestionNo": 4, "Question": "Which planet is known as the Red Planet?", "Option1": "Earth", "Option2": "Mars", "Option3": "Jupiter", "Option4": "Saturn", "CorrectOption": 2 },
  { "QuestionNo": 5, "Question": "Who wrote 'To Kill a Mockingbird'?", "Option1": "Harper Lee", "Option2": "Mark Twain", "Option3": "J.K. Rowling", "Option4": "F. Scott Fitzgerald", "CorrectOption": 1 },
  { "QuestionNo": 6, "Question": "What is the largest mammal in the world?", "Option1": "Elephant", "Option2": "Blue Whale", "Option3": "Giraffe", "Option4": "Great White Shark", "CorrectOption": 2 },
  { "QuestionNo": 7, "Question": "Which element has the chemical symbol 'O'?", "Option1": "Gold", "Option2": "Oxygen", "Option3": "Osmium", "Option4": "Oganesson", "CorrectOption": 2 },
  { "QuestionNo": 8, "Question": "In which year did the Titanic sink?", "Option1": "1905", "Option2": "1912", "Option3": "1918", "Option4": "1923", "CorrectOption": 2 },
  { "QuestionNo": 9, "Question": "What is the hardest natural substance on Earth?", "Option1": "Gold", "Option2": "Iron", "Option3": "Diamond", "Option4": "Quartz", "CorrectOption": 3 },
  { "QuestionNo": 10, "Question": "Who painted the Mona Lisa?", "Option1": "Vincent van Gogh", "Option2": "Pablo Picasso", "Option3": "Leonardo da Vinci", "Option4": "Claude Monet", "CorrectOption": 3 },
  { "QuestionNo": 11, "Question": "What is the main ingredient in guacamole?", "Option1": "Tomato", "Option2": "Avocado", "Option3": "Onion", "Option4": "Lime", "CorrectOption": 2 },
  { "QuestionNo": 12, "Question": "How many continents are there?", "Option1": "5", "Option2": "6", "Option3": "7", "Option4": "8", "CorrectOption": 3 },
  { "QuestionNo": 13, "Question": "What is the currency of Japan?", "Option1": "Yuan", "Option2": "Won", "Option3": "Yen", "Option4": "Dollar", "CorrectOption": 3 },
  { "QuestionNo": 14, "Question": "Which country is home to the kangaroo?", "Option1": "South Africa", "Option2": "India", "Option3": "Australia", "Option4": "Brazil", "CorrectOption": 3 },
  { "QuestionNo": 15, "Question": "What is the tallest mountain in the world?", "Option1": "K2", "Option2": "Kangchenjunga", "Option3": "Lhotse", "Option4": "Mount Everest", "CorrectOption": 4 },
  { "QuestionNo": 16, "Question": "Who is the author of the Harry Potter series?", "Option1": "J.R.R. Tolkien", "Option2": "George R.R. Martin", "Option3": "J.K. Rowling", "Option4": "C.S. Lewis", "CorrectOption": 3 },
  { "QuestionNo": 17, "Question": "What is the capital of Canada?", "Option1": "Toronto", "Option2": "Vancouver", "Option3": "Montreal", "Option4": "Ottawa", "CorrectOption": 4 },
  { "QuestionNo": 18, "Question": "What does 'CPU' stand for?", "Option1": "Central Processing Unit", "Option2": "Computer Personal Unit", "Option3": "Central Power Unit", "Option4": "Computer Processing Unit", "CorrectOption": 1 },
  { "QuestionNo": 19, "Question": "Which ocean is the largest?", "Option1": "Atlantic", "Option2": "Indian", "Option3": "Arctic", "Option4": "Pacific", "CorrectOption": 4 },
  { "QuestionNo": 20, "Question": "What is the chemical formula for water?", "Option1": "CO2", "Option2": "H2O", "Option3": "NaCl", "Option4": "O2", "CorrectOption": 2 }
];

// Add more questions to reach 200...
for (let i = 21; i <= 200; i++) {
    questions.push({
        QuestionNo: i,
        Question: `Sample Question ${i}: What is option 1?`,
        Option1: `Option 1 for Q${i}`,
        Option2: `Option 2 for Q${i}`,
        Option3: `Option 3 for Q${i}`,
        Option4: `Option 4 for Q${i}`,
        CorrectOption: 1
    });
}
