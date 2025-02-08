import React, { useEffect, useState } from 'react'
import { Answer, ResolutionPayload } from '../../models/FuzzyControlModels';

const BackwardsForwardsContent = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [questions, setQuestions] = useState<string[]>([]);   
    const [rules, setRules] = useState<string[]>([]); 
    const [response, setResponse] = useState<string>('');

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleAnswerChange = (question: string, value: string) => {
        setAnswers(prevAnswers => {
            const updatedAnswers = [...prevAnswers];
            const existingAnswerIndex = updatedAnswers.findIndex(ans => ans.question === question);

            if (existingAnswerIndex !== -1) {
                updatedAnswers[existingAnswerIndex].answer = value;
            } else {
                updatedAnswers.push({ question, answer: value });
            }

            return updatedAnswers;
        });
    };

    const handleSubmit = async (method: string) => {
        const payload: ResolutionPayload = {
            answers: answers,
        };
            
        try {
            const response = await fetch(`http://localhost:3001/backwards-forwards-chaining/submit-answers?method=${method}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                throw new Error('Failed to submit answers');
            }
    
            const data = await response.json();
            console.log('Prolog server response:', data);
            setResponse(data.result)
        } catch (error: any) {
            console.error('Error submitting answers:', error);
            setError(`Error submitting answers: ${error.message}`);
        }
    };

    useEffect(() => {
            const fetchInitials = async () => {
                await delay(2000);
                try {
                    const response = await fetch('http://localhost:3001/backwards-forwards-chaining/rules');
                    const data = await response.json();
                    setRules(data.rules);
                } catch (error : any) {
                    console.error('Error fetching rules:', error);
                    setError(`Error fetching rules: ${error.message}`);
                    setLoading(false);
                }            
                try {
                    const response = await fetch('http://localhost:3001/backwards-forwards-chaining/questions');
                    const data = await response.json();
                    setQuestions(data.questions);
                } catch (error : any) {
                    console.error('Error fetching questions:', error);
                    setError(`Error fetching questions: ${error.message}`);
                    setLoading(false);
                }
                setLoading(false);
            };
            fetchInitials();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (loading) {
        return<div className="col p-0 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    }

    return (
        <>
            <div className="col-2 p-0 d-flex justify-content-center">
                <div className="card w-100 p-0" data-mdb-theme="dark" style={{ borderRadius: "0" }}>

                </div>
            </div>
            <div className="col-8 p-0 d-flex justify-content-center">
                <div className="card w-100 p-0" data-mdb-theme="dark" style={{ borderRadius: "0" }}>     
                    <div className="card-body p-0 mt-3 d-flex flex-column">
                        <div className="form-outline mw-25 px-3 py-1" data-mdb-input-init>
                            <h4>Rules</h4>
                            <textarea 
                                className="form-control" 
                                id="inputContentArea"
                                rows={4} 
                                style={{ border: "1px solid #ced4da", borderRadius: "4px" }} 
                                value={rules.join("\n") || ''} 
                                readOnly>
                            </textarea>
                        </div>
                        <form className='px-3 py-3'>
                            {questions.map((question, index) => (
                                <div key={index} className="mb-3">
                                    <label className="form-label">{question}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={answers.find(ans => ans.question === question)?.answer || ''}
                                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                                        placeholder="Enter answer"
                                    />
                                </div>
                            ))}
                        </form>
                        <div className="d-flex justify-content-around">
                            <button
                                type="button"
                                className="btn btn-primary w-25"
                                onClick={() => handleSubmit('backward')}
                            >
                                Backwards Chaining
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary w-25"
                                onClick={() => handleSubmit('forward')}
                            >
                                Forward Chaining
                            </button>
                        </div>
                        <div className="form-outline mw-25 px-3 py-1 mt-4" data-mdb-input-init>
                            <h4>Is the politician an establishment figure?</h4>
                            <textarea 
                                className="form-control" 
                                id="inputContentArea"
                                rows={4} 
                                style={{ border: "1px solid #ced4da", borderRadius: "4px" }} 
                                value={response || ''} 
                                readOnly>
                            </textarea>
                        </div>
                    </div>
                </div>                           
            </div>
            <div className="col-2 p-0 d-flex justify-content-center">
                <div className="card w-100 p-0" data-mdb-theme="dark" style={{ borderRadius: "0" }}>
                    
                </div>                    
            </div>
        </>
    )
}

export default BackwardsForwardsContent