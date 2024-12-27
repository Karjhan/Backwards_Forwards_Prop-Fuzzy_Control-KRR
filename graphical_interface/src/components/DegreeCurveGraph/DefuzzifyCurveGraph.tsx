import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const DefuzzifyCurveGraph: React.FC<{curve: Array<Array<number>>, rewardScore: number}> = ({ curve, rewardScore }) => {
    const interpolatePoints = (curveValues: [number, number][], step = 0.1) => {
        console.log(curveValues)

        const interpolatedX: number[] = [];
        const interpolatedY: number[] = [];

        for (let i = 0; i < curveValues.length - 1; i++) {
            const [x1, y1] = curveValues[i];
            const [x2, y2] = curveValues[i + 1];
            const deltaX = x2 - x1;

            for (let x = x1; x <= x2; x += step) {
                const t = (x - x1) / deltaX; 
                const y = y1 + t * (y2 - y1); 
                interpolatedX.push(parseFloat(x.toFixed(2)));
                interpolatedY.push(parseFloat(y.toFixed(2)));
            }
        }

        console.log('Interpolated X Values:', interpolatedX);
        console.log('Interpolated Y Values:', interpolatedY);

        return { x: interpolatedX, y: interpolatedY };
    };

    const getPredictedY = (rewardScore: number): number | undefined => {
        for (let i = 0; i < validCurve.length - 1; i++) {
            const [x1, y1] = validCurve[i];
            const [x2, y2] = validCurve[i + 1];

            if (rewardScore >= x2 && rewardScore <= x1) {
                const deltaX = x2 - x1;
                const t = (rewardScore - x1) / deltaX;
                return y1 + t * (y2 - y1); 
            }
        }
        return undefined; 
    };

    const validCurve: [number, number][] = curve.filter((point) => point.length === 2) as [number, number][];
    const { x: xValues, y: yValues } = interpolatePoints([...validCurve].reverse(), 0.1);

    const predictedY = getPredictedY(rewardScore);

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
                label: 'Defuzzifying Curve',
                data: yValues,
                fill: false,
                borderColor: '#1795d3',
                tension: 0.1,
                pointRadius: 0,
            },
            {
                label: 'Predicted Point',
                data: predictedY ? [{ x: rewardScore, y: predictedY/2 }] : [], 
                backgroundColor: 'red',
                borderColor: 'red',
                pointRadius: 3, 
                showLine: false, 
            },
        ],
    };

    return (
        <div style={{ width: '100%', height: '270px', marginTop: "1rem" }}>
            <Line data={data} options={options} />
        </div>

    );
};

export default DefuzzifyCurveGraph;
