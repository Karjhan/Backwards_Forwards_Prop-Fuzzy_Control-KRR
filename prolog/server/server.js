let fetch;

import('node-fetch').then((module) => {
    fetch = module.default;  

    const express = require('express');
    const cors = require('cors');
    const fs = require('fs');
    const path = require('path');

    const app = express();
    const PORT = 3001;

    const fuzzyControlFolder = path.join(__dirname, '../fuzzy-control');
    const backwardsForwardsChainingFolder = path.join(__dirname, '../backwards-forwards-chaining');

    app.use(express.json());
    app.use(cors());

    const parsePrologToJson = (prologContent) => {
        const lines = prologContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
        let degreeCurves = [];
        let currentSection = null;
        let currentCurves = {};
        let currentRange = null;
    
        const sectionPattern = /^%\s+"(\w+)"\s+-\s+Degree curves for "\w+"\s+predicate\s+with\s+values\s+between\s+\((\d+),(\d+)\)/;
        const rulePattern = /^(\w+)\(([^,]+),\s*Degree\)\s*:-\s*(.*)/;
        const degreePattern = /(.*)\s+is\s+(.*)/;
    
        console.log("Processing lines...");
        lines.forEach(line => {
            const sectionMatch = line.match(sectionPattern);
            if (sectionMatch) {
                console.log("Matched section:", sectionMatch[0]);
    
                if (currentSection) {
                    degreeCurves.push({
                        predicateName: currentSection,
                        functionRange: currentRange,
                        curves: Object.values(currentCurves)
                    });
                }
    
                currentSection = sectionMatch[1].toLowerCase();
                currentRange = [parseInt(sectionMatch[2], 10), parseInt(sectionMatch[3], 10)];
                currentCurves = {};
                return;
            }
    
            const ruleMatch = line.match(rulePattern);
            if (ruleMatch && currentSection) {
                console.log("Matched rule:", ruleMatch[0]);
    
                const [_, predicate, variable, body] = ruleMatch;
    
                const degreeMatch = body.match(degreePattern);
                let range, degreeFormula;
    
                if (degreeMatch) {
                    range = degreeMatch[1].replace(/,?\s*Degree\s*/g, '').trim();
                    degreeFormula = degreeMatch[2].replace(/\.$/, '').trim();
                } else {
                    range = body.replace(/\.$/, '').trim();
                    degreeFormula = "0";
                }
    
                const rangeParts = range.split(';').map(part => part.trim());
    
                if (!currentCurves[predicate]) {
                    currentCurves[predicate] = {
                        baseFunctionName: predicate,
                        rules: []
                    };
                }
    
                rangeParts.forEach(rangePart => {
                    currentCurves[predicate].rules.push({
                        range: rangePart,
                        degree: degreeFormula
                    });
                });
            }
        });
    
        if (currentSection) {
            degreeCurves.push({
                predicateName: currentSection,
                functionRange: currentRange,
                curves: Object.values(currentCurves)
            });
        }
    
        console.log("Final parsed result:", JSON.stringify(degreeCurves, null, 2));
        return degreeCurves;
    };

    const parsePrologResponse = (responseText) => {
        const curveMatch = responseText.match(/Defuzzifying curve: \[(.*?)\]/);
        const curveString = curveMatch ? curveMatch[1].replace(/\((\d+,\d+(\.\d+)?)\)/g, '[$1]') : '[]';
    
        const numeratorMatch = responseText.match(/Numerator = ([\d.]+)/);
        const denominatorMatch = responseText.match(/Denominator = ([\d.]+)/);
        const rewardMatch = responseText.match(/Defuzzified Reward = ([\d.]+)/);
    
        return {
            defuzzifyingCurve: JSON.parse(`[${curveString}]`), 
            numerator: numeratorMatch ? parseFloat(numeratorMatch[1]) : null,
            denominator: denominatorMatch ? parseFloat(denominatorMatch[1]) : null,
            rewardScore: rewardMatch ? parseFloat(rewardMatch[1]) : null,
            status: 'success',
        };
    };
    
    const parseRulesFile = (filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const rules = [];
    
        const rulePattern = /^rule\(\[(\w+),\s*\[(\w+\/\w+),\s*(\w+\/\w+)\],\s*\[(\w+\/\w+)]\]\)\.$/;
    
        lines.forEach(line => {
            console.log('Processing line:', line); 
            const match = line.match(rulePattern);
            if (match) {
                console.log('Match found:', match); 
                const [_, operator, condition1, condition2, result] = match;
    
                rules.push({
                    operator: operator,
                    conditions: [
                        { term: condition1.split('/')[0], value: condition1.split('/')[1] },
                        { term: condition2.split('/')[0], value: condition2.split('/')[1] }
                    ],
                    result: { term: result.split('/')[0], value: result.split('/')[1] }
                });
            }
        });
    
        console.log('Parsed rules:', rules); 
        return rules;
    };

    app.get('/fuzzy-control/degree-curves', (req, res) => {
        try {
            const degreeCurvesPath = path.join(fuzzyControlFolder, 'degree_curves.pl');
            const prologContent = fs.readFileSync(path.resolve(degreeCurvesPath), 'utf-8');
            const jsonDegreeCurves = parsePrologToJson(prologContent);
            res.json(jsonDegreeCurves);
        } catch (err) {
            console.error('Error reading or parsing Prolog file:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get('/fuzzy-control/rules', (req, res) => {
        try {
            const rulesFilePath = path.join(fuzzyControlFolder, 'rules.pl');
            const rules = parseRulesFile(rulesFilePath);
            res.json(rules);
        } catch (err) {
            console.error('Error reading or parsing Prolog file:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get('/fuzzy-control/questions', (req, res) => {
        const filePath = path.join(fuzzyControlFolder, 'input.txt');
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
    
            const lines = fileContent.split('\n').filter((line, index) => {
                return index % 2 === 0 && line.trim() !== '';  
            }).map(line => line.replace(/\r/g, '').trim());
    
            return res.json({ questions: lines });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ status: 'error', message: 'Error reading questions from file' });
        }
    });

    app.post('/fuzzy-control/submit-answers', async (req, res) => {
        const { answers } = req.body;
        console.log('Received answers:', answers);
    
        if (!answers || !Array.isArray(answers)) {
            console.error('Invalid input: Answers not provided or not in array format.');
            return res.status(400).json({ status: 'error', message: 'Invalid input' });
        }
    
        const filePath = path.join(fuzzyControlFolder, 'input.txt');
        console.log(filePath.replace(/\\/g, '/'))
        
        try {
            let fileContent = fs.readFileSync(filePath, 'utf8');
            console.log('Original file content:', fileContent);
    
            const escapeRegExp = (str) => {
                return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
            };

            answers.forEach(answer => {
                const { question, answer: userAnswer } = answer;
                console.log(`Processing question: "${question}" with answer: "${userAnswer}"`);
                
                const escapedQuestion = escapeRegExp(question);
                const questionRegex = new RegExp(`(${escapedQuestion})\\s*(\\d+)?\\s*`, 'g');
    
                if (!questionRegex.test(fileContent)) {
                    console.warn(`Question "${question}" not found in the file.`);
                }
    
                fileContent = fileContent.replace(questionRegex, `$1\n${userAnswer}\n`);
            });
            console.log('Modified file content:', fileContent);  

            fs.writeFileSync(filePath, fileContent);
            console.log('File updated successfully.');
    
            const requestBody = { fileName: filePath.replace(/\\/g, '/') };
            console.log('Sending request body:', requestBody);

            const prologServerResponse = await fetch('http://localhost:3002/fuzzy-control', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const prologResultText = await prologServerResponse.text();
            const structuredResult = parsePrologResponse(prologResultText);
            console.log('Structured Prolog response:', structuredResult);
    
            return res.json(structuredResult);
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Error loading node-fetch:', err);
});
