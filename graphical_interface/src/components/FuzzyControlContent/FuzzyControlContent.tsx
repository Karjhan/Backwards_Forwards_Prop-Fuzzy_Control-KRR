import React, { useEffect, useState } from 'react'
import { Answer, FuzzyControlResponse, PredicateResponse, ResolutionPayload, Rule } from '../../models/FuzzyControlModels';
import DegreeCurveGraph from '../DegreeCurveGraph/DegreeCurveGraph';
import DefuzzifyCurveGraph from '../DegreeCurveGraph/DefuzzifyCurveGraph';

const FuzzyControlContent = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [degreeCurves, setDegreeCurves] = useState<PredicateResponse[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [questions, setQuestions] = useState<string[]>([]);
    const [response, setResponse] = useState<FuzzyControlResponse>();

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const formatRules = (rules: Rule[]): string => {
        return rules
            .map(rule => {
                const conditions = rule.conditions
                    .map(cond => `${cond.term}/${cond.value}`)
                    .join(` ${rule.operator.toUpperCase()} `);
                return `${conditions} => ${rule.result.term}/${rule.result.value}`;
            })
            .join('\n');
    };

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

    const handleSubmit = async () => {
        const payload: ResolutionPayload = {
            answers: answers,
        };
        try {
            const response = await fetch('http://localhost:3001/fuzzy-control/submit-answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status === 'success') {
                console.log('Submission successful', data);
                setResponse(data)
            } else {
                console.error('Submission failed', data);
            }
        } catch (error) {
            console.error('Error during submission', error);
        }
    };

    useEffect(() => {
        const fetchInitials = async () => {
            await delay(2000);
            try {
                const response = await fetch('http://localhost:3001/fuzzy-control/degree-curves');
                const data: PredicateResponse[] = await response.json();
                setDegreeCurves(data);
            } catch (error : any) {
                console.error('Error fetching degree curves:', error);
                setError(`Error fetching degree curves: ${error.message}`);
                setLoading(false);
            }
            try {
                const response = await fetch('http://localhost:3001/fuzzy-control/rules');
                const data: Rule[] = await response.json();
                setRules(data);
            } catch (error : any) {
                console.error('Error fetching rules:', error);
                setError(`Error fetching rules: ${error.message}`);
                setLoading(false);
            }
            try {
                const response = await fetch('http://localhost:3001/fuzzy-control/questions');
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
            <div className="col-8 p-0 d-flex justify-content-center">
                <div className="card w-100 p-0" data-mdb-theme="dark" style={{ borderRadius: "0" }}>
                    <div className="card-body p-0 mt-4 d-flex flex-column">
                        {degreeCurves.map((predicate, predicateIndex) => (
                            <div key={predicateIndex} className="d-flex flex-column p-0 w-100">
                                <hr className='m-1' style={{borderTop:"3px solid #1795d3"}}/>
                                <div className='p-0 m-0 d-flex align-items-center justify-content-center'>
                                    <h3 className='m-0'>{predicate.predicateName.toLocaleUpperCase()}</h3>
                                </div>
                                <hr className='m-1' style={{borderTop:"3px solid #1795d3"}}/>
                                <div className="d-flex justify-content-between flex-wrap">
                                    {predicate.curves.map((curve, curveIndex) => (
                                        <div key={curveIndex} className="d-flex flex-column align-items-center mx-5">
                                            <h5>{curve.baseFunctionName.toLocaleUpperCase()}</h5>
                                            <h5>{`Interval: [${predicate.functionRange[0]},${predicate.functionRange[1]}]`}</h5>
                                            {curve.rules.map((rule, ruleIndex) => (
                                                <div key={ruleIndex} className="text-start d-flex">
                                                    <p className="m-0 mx-1">
                                                        <strong>Range:</strong> {rule.range}
                                                    </p>
                                                    <p className="m-0 mx-1">
                                                        <strong>Degree:</strong> {rule.degree}
                                                    </p>
                                                </div>
                                            ))}
                                            <DegreeCurveGraph curve={curve} interval={predicate.functionRange} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="col-4 p-0 d-flex justify-content-center" style={{borderLeft:"3px ridge #1795d3"}}>
                <div className="card w-100 p-0" data-mdb-theme="dark" style={{ borderRadius: "0" }}>     
                    <div className="card-body p-0 mt-3 d-flex flex-column">
                        <div className="form-outline mw-25 px-3 py-1" data-mdb-input-init>
                            <h4>Rules</h4>
                            <textarea 
                                className="form-control" 
                                id="inputContentArea"
                                rows={4} 
                                style={{ border: "1px solid #ced4da", borderRadius: "4px" }} 
                                value={formatRules(rules) || ''} 
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
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </form>
                        <div className="form-outline mw-25 px-3 py-1" data-mdb-input-init>
                            <h4>Reward Score Answer</h4>
                            <textarea 
                                className="form-control" 
                                id="inputContentArea"
                                rows={4} 
                                style={{ border: "1px solid #ced4da", borderRadius: "4px" }} 
                                value={response?.rewardScore || ''} 
                                readOnly>
                            </textarea>
                        </div>
                        <div className='d-flex align-items-center p-0 mx-5'>
                            {response?.defuzzifyingCurve ? (
                                <DefuzzifyCurveGraph curve={response.defuzzifyingCurve} rewardScore={response.rewardScore}/>
                            ) : (
                                <p></p>
                            )}
                        </div>
                    </div>
                </div>                           
            </div>
        </>  
    )
}

export default FuzzyControlContent