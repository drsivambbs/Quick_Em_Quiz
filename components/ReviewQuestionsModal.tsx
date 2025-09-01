import React, { useState, useEffect } from 'react';
import type { Question, GroundingChunk } from '../types';
import Button from './Button';

type GeneratedQuestion = Omit<Question, 'QuestionNo'>;

interface ReviewQuestionsModalProps {
    questions: GeneratedQuestion[];
    onAdd: (questions: GeneratedQuestion[]) => void;
    onClose: () => void;
    citations?: GroundingChunk[];
}

const ReviewQuestionsModal: React.FC<ReviewQuestionsModalProps> = ({ questions, onAdd, onClose, citations }) => {
    const [localQuestions, setLocalQuestions] = useState<GeneratedQuestion[]>(questions);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<GeneratedQuestion | null>(null);

    useEffect(() => {
        setLocalQuestions(questions);
    }, [questions]);
    
    const handleDelete = (index: number) => {
        setLocalQuestions(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditFormData(localQuestions[index]);
    };

    const handleSave = (index: number) => {
        if (editFormData) {
            setLocalQuestions(prev => prev.map((q, i) => i === index ? editFormData : q));
        }
        setEditingIndex(null);
        setEditFormData(null);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editFormData) {
            const { name, value } = e.target;
            setEditFormData({
                ...editFormData,
                [name]: name === 'CorrectOption' ? parseInt(value, 10) : value
            });
        }
    }

    const renderEditableField = (name: keyof GeneratedQuestion, value: string | number, type: 'textarea' | 'text' | 'number' = 'text') => {
        const props = {
            name,
            value: value,
            onChange: handleFormChange,
            className: "w-full p-2 bg-slate-900 rounded-md border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400",
        };
        if (type === 'textarea') {
            return <textarea {...props} rows={3} />;
        }
        return <input {...props} type={type} />;
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Review & Approve Questions</h2>
                    <p className="text-slate-400">Review, edit, or delete questions before adding them to the bank.</p>
                     {citations && citations.length > 0 && (
                        <div className="mt-3 text-xs text-slate-500 bg-slate-900/50 p-2 rounded-md">
                            <h4 className="font-semibold text-slate-400">Sources used for generation:</h4>
                            <ul className="list-disc list-inside columns-2">
                                {citations.map((c, i) => (
                                    <li key={i} className="truncate">
                                        <a href={c.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400" title={c.web.title}>
                                            {c.web.title || c.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </header>
                
                <main className="p-6 overflow-y-auto space-y-4">
                    {localQuestions.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No new unique questions to add. You can close this or try again.</p>
                    ) : localQuestions.map((q, index) => (
                        <div key={index} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                            {editingIndex === index && editFormData ? (
                                <div className="space-y-3">
                                    <label className="font-semibold text-slate-300">Question:</label>
                                    {renderEditableField('Question', editFormData.Question, 'textarea')}
                                    {[1, 2, 3, 4].map(optIndex => {
                                        const key = `Option${optIndex}` as keyof GeneratedQuestion;
                                        return (
                                            <div key={optIndex} className="flex items-center gap-2">
                                                <label className="text-slate-400 w-20">Option {optIndex}:</label>
                                                {renderEditableField(key, editFormData[key] as string)}
                                            </div>
                                        );
                                    })}
                                    <div className="flex items-center gap-2">
                                         <label className="text-slate-400 w-32">Correct Option (1-4):</label>
                                         <input
                                            type="number"
                                            name="CorrectOption"
                                            value={editFormData.CorrectOption}
                                            onChange={handleFormChange}
                                            min="1" max="4"
                                            className="w-20 p-2 bg-slate-900 rounded-md border border-indigo-500"
                                         />
                                    </div>
                                    <Button onClick={() => handleSave(index)} className="mt-2">Save Changes</Button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-lg text-slate-200 pr-4">{index + 1}. {q.Question}</p>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <Button onClick={() => handleEdit(index)} variant="secondary" className="px-3 py-1 text-sm">Edit</Button>
                                            <Button onClick={() => handleDelete(index)} variant="secondary" className="px-3 py-1 text-sm bg-red-800 hover:bg-red-700">Delete</Button>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1 pl-4">
                                        {[1, 2, 3, 4].map(optIndex => {
                                             const key = `Option${optIndex}` as keyof GeneratedQuestion;
                                             const isCorrect = q.CorrectOption === optIndex;
                                             return (
                                                <p key={optIndex} className={`text-slate-300 ${isCorrect ? 'font-bold text-green-400' : ''}`}>
                                                    {optIndex}) {q[key] as string}
                                                </p>
                                             );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </main>

                <footer className="p-6 border-t border-slate-700 flex justify-end space-x-4">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={() => onAdd(localQuestions)} disabled={localQuestions.length === 0}>
                        Add {localQuestions.length} Questions to Bank
                    </Button>
                </footer>
            </div>
        </div>
    );
};

export default ReviewQuestionsModal;