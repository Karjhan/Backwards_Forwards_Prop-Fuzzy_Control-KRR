import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { GraphProps } from '../../models/DegreeCurveGraphProps';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const DegreeCurveGraph: React.FC<GraphProps> = ({ curve, interval }) => {
    const parseRange = (range: string) => {
        const matches = range.match(/(-?\d+(\.\d+)?)/g);
        return matches ? matches.map(parseFloat) : [];
    };

    const [intervalStart, intervalEnd] = interval;
    const xValues: number[] = [];
    const yValues: number[] = [];
    for (let x = intervalStart; x <= intervalEnd; x += 0.1) {
        xValues.push(parseFloat(x.toFixed(1))); 
    }

    xValues.forEach((x) => {
        let degree = 0; 
        for (const rule of curve.rules) {
            const range = parseRange(rule.range);
            if (range.length === 2) {
                const [start, end] = range;

                if (x >= start && x <= end) {
                    try {
                        degree = eval(rule.degree.replace(/X/g, x.toString()));
                    } catch (error) {
                        console.error(`Error evaluating degree formula "${rule.degree}" for X=${x}:`, error);
                    }
                    break; 
                }
            }
        }

        yValues.push(degree);
    });

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    const data = {
        labels: xValues,
        datasets: [
            {
                label: curve.baseFunctionName,
                data: yValues,
                fill: false,
                borderColor: '#1795d3',
                tension: 0.1,
                pointRadius: 0,
            },
        ],
    };

    return (
        <div style={{ width: '250px', height: '110px' }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default DegreeCurveGraph;
