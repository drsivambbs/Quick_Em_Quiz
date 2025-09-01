import React, { useState, useRef, useEffect } from 'react';
import type { Question, GroundingChunk } from '../types';
import Button from './Button';
import { GoogleGenAI, Type } from "@google/genai";
import { getQuestionBank, saveQuestionBank } from '../services/questionService';
import ReviewQuestionsModal from './ReviewQuestionsModal';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';


type GeneratedQuestion = Omit<Question, 'QuestionNo'>;
type GeneratorTab = 'context' | 'existing';

interface AdminDashboardScreenProps {
  onLogout: () => void;
  initialQuestionCount: number;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onLogout, initialQuestionCount }) => {
  const [questionCount, setQuestionCount] = useState(initialQuestionCount);
  
  // State for AI Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatorTab, setGeneratorTab] = useState<GeneratorTab>('context');
  const [customPrompt, setCustomPrompt] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [numQuestionsToGenerate, setNumQuestionsToGenerate] = useState(5);
  const [generationTime, setGenerationTime] = useState(0);
  const generationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


  // State for Manual Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Shared state for review modal
  const [questionsForReview, setQuestionsForReview] = useState<GeneratedQuestion[]>([]);
  const [reviewCitations, setReviewCitations] = useState<GroundingChunk[]>([]);

  // Stop timer if component unmounts
  useEffect(() => {
    return () => {
      if (generationIntervalRef.current) {
        clearInterval(generationIntervalRef.current);
      }
    };
  }, []);

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadMessage(null);
    }
  };
  
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setGenerationError(null);
    if (file && file.type === 'application/pdf') {
        setPdfFile(file);
        setIsProcessingPdf(true);
        setPdfText(null);
        setCustomPrompt(''); // Clear other inputs
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                  if (event.target?.result) {
                      const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
                      const pdf = await pdfjsLib.getDocument(typedArray).promise;
                      let fullText = '';
                      for (let i = 1; i <= pdf.numPages; i++) {
                          const page = await pdf.getPage(i);
                          const textContent = await page.getTextContent();
                          const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                          fullText += pageText + '\n\n';
                      }
                      setPdfText(fullText.trim());
                  }
                } catch (pdfError) {
                   console.error('Error parsing PDF content:', pdfError);
                   setGenerationError('Failed to parse content from the PDF file. It might be corrupted or image-based.');
                   setPdfFile(null);
                } finally {
                   setIsProcessingPdf(false);
                }
            };
            reader.onerror = () => {
              throw new Error("Could not read the PDF file.");
            }
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error processing PDF:', error);
            setGenerationError(error instanceof Error ? error.message : 'Failed to read content from the PDF file.');
            setIsProcessingPdf(false);
            setPdfFile(null);
        }
    } else {
        setPdfFile(null);
        setPdfText(null);
        if(file) {
          setGenerationError("Please select a valid PDF file.");
        }
    }
  };


  const validateQuestionStructure = (data: any): data is Question[] => {
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

  const handleFileUpload = async () => {
    if (!uploadFile) {
        setUploadMessage("Please select a file first.");
        return;
    }

    setIsUploading(true);
    setUploadMessage("Reading and validating file...");

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("Could not read file content.");
            const uploadedJson = JSON.parse(text);

            if (!validateQuestionStructure(uploadedJson)) {
                throw new Error("Invalid JSON structure. Ensure it's an array of questions with the correct fields.");
            }
            
            setUploadMessage("File format is valid. Checking questions with AI for duplicates and accuracy...");

            const currentBank = getQuestionBank();
            const exampleCurrent = currentBank.sort(() => 0.5 - Math.random()).slice(0, 20);

            const prompt = `You are a quiz validation AI. Review the "new_questions" provided in JSON format.
            1. Compare them against the "existing_questions_sample" to identify and remove any duplicates or very similar questions.
            2. For the remaining unique questions, verify the factual accuracy of the question and ensure the 'CorrectOption' is indeed the right answer. Ensure all questions meet the 'Tamilnadu Teacher Recruitment Board Exam (PGTRB)' standard - suitable for post-graduate teachers, not overly complex.
            3. If you find an incorrect 'CorrectOption', fix it. You can also make minor phrasing improvements for clarity.
            4. Return a JSON array containing ONLY the unique, validated, and corrected questions that are ready to be added to the question bank. The format of each object in the array must match the input format. If no new questions are valid, return an empty array [].

            Existing Questions Sample: ${JSON.stringify(exampleCurrent.map(q => q.Question))}

            New Questions to Validate: ${JSON.stringify(uploadedJson)}
            `;
            
            const responseSchema = {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    Question: { type: Type.STRING },
                    Option1: { type: Type.STRING },
                    Option2: { type: Type.STRING },
                    Option3: { type: Type.STRING },
                    Option4: { type: Type.STRING },
                    CorrectOption: { type: Type.INTEGER },
                  },
                  required: ["Question", "Option1", "Option2", "Option3", "Option4", "CorrectOption"]
                }
            };

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                  responseMimeType: "application/json",
                  responseSchema: responseSchema,
                },
            });
            
            const validatedQuestions: GeneratedQuestion[] = JSON.parse(response.text);
            
            // Final client-side check for duplicates
            const currentQuestionTexts = new Set(currentBank.map(q => q.Question.toLowerCase().trim()));
            const trulyUniqueQuestions = validatedQuestions.filter(q =>
                q.Question && !currentQuestionTexts.has(q.Question.toLowerCase().trim())
            );

            if (trulyUniqueQuestions.length === 0) {
                setUploadMessage("AI review complete. No new unique questions were found to add.");
            } else {
                setUploadMessage(`AI review complete. ${trulyUniqueQuestions.length} new questions are ready for your approval.`);
                setQuestionsForReview(trulyUniqueQuestions);
                setReviewCitations([]); // No citations for upload validation
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during validation.";
            console.error("Upload validation error:", error);
            setUploadMessage(errorMessage);
        } finally {
            setIsUploading(false);
            const fileInput = document.getElementById('question-file') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            setUploadFile(null);
        }
    };
    reader.onerror = () => {
        setUploadMessage('Error reading file.');
        setIsUploading(false);
    }
    reader.readAsText(uploadFile);
  };
  
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setQuestionsForReview([]);

    const estimatedTime = numQuestionsToGenerate * 6; // ~6 seconds per question
    setGenerationTime(estimatedTime);
    generationIntervalRef.current = setInterval(() => {
        setGenerationTime(prev => Math.max(0, prev - 1));
    }, 1000);
    
    try {
      let contextPrompt = '';
      let contextInstruction = '';
      const currentQuestions = getQuestionBank();
      
      if (generatorTab === 'context') {
        let sourceText = '';
        if (pdfText) {
          sourceText = pdfText;
          contextInstruction = 'Based on the following content extracted from a PDF document';
        } else if (customPrompt.trim()) {
          sourceText = customPrompt.trim();
          contextInstruction = 'Based on the following text';
        } else {
          throw new Error("Please upload a PDF or enter text in the prompt box to generate questions.");
        }
        contextPrompt = `Source Content: """\n${sourceText}\n"""`;

      } else { // 'existing' tab
        const exampleQuestions = currentQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
        contextInstruction = 'Based on the following example questions';
        contextPrompt = `Examples:\n${JSON.stringify(exampleQuestions.map(({ Question, Option1, Option2, Option3, Option4, CorrectOption }) => ({ Question, Option1, Option2, Option3, Option4, CorrectOption })))}`;
      }

      const prompt = `${contextInstruction}, generate ${numQuestionsToGenerate} new, unique, multiple-choice questions with 4 options. 
      
      ${contextPrompt}

      IMPORTANT: All questions must be of 'Tamilnadu Teacher Recruitment Board Exam (PGTRB)' standard. This means they should be suitable for post-graduate teachers, focused on educational theory, policy, and psychology, and not be overly simplistic, overly complex, or obscure.
      The questions should be factually accurate and not repeat any provided examples or trivial knowledge. Ensure the questions are directly relevant to the source material provided.
      
      Your entire response must be a single, valid JSON array of question objects, and nothing else. Do not wrap it in markdown backticks. The JSON schema for each object is: { "Question": "string", "Option1": "string", "Option2": "string", "Option3": "string", "Option4": "string", "CorrectOption": integer (1-4) }`;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      
      let parsedQuestions: GeneratedQuestion[];
      try {
        const jsonText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedQuestions = JSON.parse(jsonText);
      } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", response.text);
        throw new Error("The AI returned an invalid response format. Please try again.");
      }
      
      const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      
      const currentQuestionTexts = new Set(currentQuestions.map(q => q.Question.toLowerCase().trim()));
      const uniqueNewQuestions = parsedQuestions.filter(q => q.Question && !currentQuestionTexts.has(q.Question.toLowerCase().trim()));

      if (uniqueNewQuestions.length === 0 && parsedQuestions.length > 0) {
        setGenerationError("Generated questions were already in the bank. Try again for more variety.");
      } else if (uniqueNewQuestions.length === 0) {
        setGenerationError("The AI couldn't generate any new questions from the provided context. Try providing more specific text.");
      }
      else {
        setQuestionsForReview(uniqueNewQuestions);
        setReviewCitations(citations || []);
      }

    } catch (error) {
      console.error("Gemini API error:", error);
      setGenerationError(error instanceof Error ? error.message : "An unknown error occurred during question generation.");
    } finally {
      setIsGenerating(false);
      if (generationIntervalRef.current) {
        clearInterval(generationIntervalRef.current);
        generationIntervalRef.current = null;
      }
      setGenerationTime(0);
    }
  }

  const handleAddToBank = (questionsToAdd: GeneratedQuestion[]) => {
    const currentBank = getQuestionBank();
    const maxId = Math.max(0, ...currentBank.map(q => q.QuestionNo));

    const newQuestionsWithIds: Question[] = questionsToAdd.map((q, index) => ({
      ...q,
      QuestionNo: maxId + 1 + index,
    }));

    const updatedBank = [...currentBank, ...newQuestionsWithIds];
    saveQuestionBank(updatedBank);
    setQuestionCount(updatedBank.length);
    setQuestionsForReview([]); // Close modal
    setReviewCitations([]);
    setUploadMessage(`${questionsToAdd.length} new questions added successfully!`);
    setTimeout(() => setUploadMessage(null), 5000);
  };
  
  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors focus:outline-none ${
        active
          ? 'bg-slate-700/50 text-indigo-300 border-b-2 border-indigo-400'
          : 'bg-transparent text-slate-400 hover:bg-slate-700/30'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-slate-800 p-8 rounded-xl shadow-2xl animate-fade-in space-y-8">
      {questionsForReview.length > 0 && (
          <ReviewQuestionsModal
              questions={questionsForReview}
              onAdd={handleAddToBank}
              onClose={() => setQuestionsForReview([])}
              citations={reviewCitations}
          />
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Button onClick={onLogout} variant="secondary">Logout</Button>
      </div>

      <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
        <h3 className="text-xl font-semibold mb-2 text-indigo-300">AI Question Generator</h3>
        <div className="flex border-b border-slate-600 mb-4">
            <TabButton active={generatorTab === 'context'} onClick={() => setGeneratorTab('context')}>From Content</TabButton>
            <TabButton active={generatorTab === 'existing'} onClick={() => setGeneratorTab('existing')}>From Existing</TabButton>
        </div>

        {generatorTab === 'context' && (
            <div className="space-y-4 animate-fade-in">
                <p className="text-slate-400 text-sm">Upload a PDF or paste text to generate questions from specific content.</p>
                <div>
                     <label htmlFor="num-questions" className="block mb-2 text-sm font-medium text-slate-300">Number of Questions (1-14)</label>
                     <input
                        type="number"
                        id="num-questions"
                        value={numQuestionsToGenerate}
                        onChange={(e) => setNumQuestionsToGenerate(Math.max(1, Math.min(14, parseInt(e.target.value, 10) || 1)))}
                        min="1"
                        max="14"
                        disabled={isGenerating}
                        className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg w-24 p-2.5 disabled:opacity-50"
                     />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-slate-300">Upload PDF</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfFileChange}
                        disabled={isGenerating || isProcessingPdf}
                        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                    />
                    {isProcessingPdf && <p className="text-sm text-amber-400 mt-2">Processing PDF...</p>}
                    {pdfFile && !isProcessingPdf && pdfText && <p className="text-sm text-green-400 mt-2">Successfully extracted text from {pdfFile.name}.</p>}
                </div>
                <div className="flex items-center gap-4">
                    <hr className="w-full border-slate-600" />
                    <span className="text-slate-500 font-semibold">OR</span>
                    <hr className="w-full border-slate-600" />
                </div>
                <div>
                     <label htmlFor="custom-prompt" className="block mb-2 text-sm font-medium text-slate-300">Paste Text Content</label>
                     <textarea
                        id="custom-prompt"
                        rows={6}
                        value={customPrompt}
                        onChange={(e) => { setCustomPrompt(e.target.value); setPdfFile(null); setPdfText(null); }}
                        disabled={isGenerating || !!pdfFile}
                        placeholder="Paste content here to generate questions from it..."
                        className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:opacity-50"
                     />
                </div>
            </div>
        )}

        {generatorTab === 'existing' && (
             <div className="animate-fade-in space-y-4">
                <p className="text-slate-400 text-sm">Generate new questions based on the style and topic of your current question bank. This is great for expanding your quiz with similar content.</p>
                 <div>
                     <label htmlFor="num-questions-existing" className="block mb-2 text-sm font-medium text-slate-300">Number of Questions (1-14)</label>
                     <input
                        type="number"
                        id="num-questions-existing"
                        value={numQuestionsToGenerate}
                        onChange={(e) => setNumQuestionsToGenerate(Math.max(1, Math.min(14, parseInt(e.target.value, 10) || 1)))}
                        min="1"
                        max="14"
                        disabled={isGenerating}
                        className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg w-24 p-2.5 disabled:opacity-50"
                     />
                </div>
            </div>
        )}
        
        <div className="flex items-center mt-6">
           <Button onClick={handleGenerateQuestions} disabled={isGenerating || isProcessingPdf}>
            {isGenerating ? 'Generating...' : `✨ Generate ${numQuestionsToGenerate} Questions`}
           </Button>
           {isGenerating && (
                <div className="flex items-center gap-3 text-amber-400 ml-4">
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span>Est. time remaining: {generationTime}s</span>
                </div>
            )}
        </div>
        {generationError && (
          <p className="mt-4 text-red-400 text-sm">{generationError}</p>
        )}
      </div>

      <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
        <h3 className="text-xl font-semibold mb-4">Question Bank Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-6 rounded-lg text-center flex flex-col justify-center items-center border border-slate-700">
                <h4 className="text-lg font-semibold text-slate-400">Total Questions</h4>
                <p className="text-6xl font-bold text-indigo-400 my-2">{questionCount}</p>
                <p className="text-xs text-slate-500">Available in the question bank.</p>
            </div>
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                Upload a JSON file to add new questions. The AI will strictly review them for duplicates and accuracy before you approve them.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  id="question-file"
                  type="file"
                  accept=".json"
                  onChange={handleJsonFileChange}
                  disabled={isUploading}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                />
                <Button onClick={handleFileUpload} disabled={!uploadFile || isUploading} className="w-full sm:w-auto flex-shrink-0">
                  {isUploading ? 'Validating...' : 'Upload & Review'}
                </Button>
              </div>

              {uploadMessage && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                      {isUploading && <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>}
                      <p className="text-center text-sm text-green-400">{uploadMessage}</p>
                  </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardScreen;