const generateQuadraticEquation = () => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const n = points.length;
    
    const sumX = sum(xs);
    const sumY = sum(ys);
    const sumXY = sum(xs.map((x, i) => x * ys[i]));
    const sumX2 = sum(xs.map(x => x * x));
    const sumX3 = sum(xs.map(x => x * x * x));
    const sumX4 = sum(xs.map(x => x * x * x * x));
    const sumX2Y = sum(xs.map((x, i) => x * x * ys[i]));
    
    const matrix = [
      [n, sumX, sumX2],
      [sumX, sumX2, sumX3],
      [sumX2, sumX3, sumX4]
    ];
    
    const vector = [sumY, sumXY, sumX2Y];
    
    for (let i = 0; i < 3; i++) {
      const pivot = matrix[i][i];
      if (Math.abs(pivot) < 1e-10) continue;
      
      for (let j = i + 1; j < 3; j++) {
        const factor = matrix[j][i] / pivot;
        for (let k = i; k < 3; k++) {
          matrix[j][k] -= factor * matrix[i][k];
        }
        vector[j] -= factor * vector[i];
      }
    }
    
    const coeffs = new Array(3).fill(0);
    for (let i = 2; i >= 0; i--) {
      let sum = vector[i];
      for (let j = i + 1; j < 3; j++) {
        sum -= matrix[i][j] * coeffs[j];
      }
      coeffs[i] = sum / matrix[i][i];
    }
    
    const [a, b, c] = coeffs;
    return `${c.toFixed(3)}x² ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(3)}x ${a >= 0 ? '+' : '-'} ${Math.abs(a).toFixed(3)}`;
  };import React, { useState, useEffect } from 'react';
import { mean, sum, round, sqrt } from 'mathjs';

export default function RegressionPlot() {
  const [points, setPoints] = useState([
    { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 5 },
    { x: 3, y: 6 }, { x: 5, y: 4 }, { x: 6, y: 8 },
    { x: 7, y: 8 }, { x: 8, y: 9 }, { x: 9, y: 9 },
    { x: 9, y: 8.5 }, { x: 6, y: 7.9 }, { x: 5, y: 5 },
    { x: 4, y: 3 }, { x: 2, y: 3 }
  ]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [stats, setStats] = useState({ r2: 0, correlation: 0 });
  const [viewType, setViewType] = useState('linear');
  const [showR2Info, setShowR2Info] = useState(false);
  const [showCorrelationInfo, setShowCorrelationInfo] = useState(false);
  const [showOutlierInfo, setShowOutlierInfo] = useState(false);
  const [showResiduals, setShowResiduals] = useState(false);

  const generateCurvePoints = () => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const n = points.length;
    
    const meanX = mean(xs);
    const meanY = mean(ys);
    
    const sumX = sum(xs);
    const sumY = sum(ys);
    const sumXY = sum(xs.map((x, i) => x * ys[i]));
    const sumX2 = sum(xs.map(x => x * x));
    const sumX3 = sum(xs.map(x => x * x * x));
    const sumX4 = sum(xs.map(x => x * x * x * x));
    const sumX2Y = sum(xs.map((x, i) => x * x * ys[i]));
    
    const matrix = [
      [n, sumX, sumX2],
      [sumX, sumX2, sumX3],
      [sumX2, sumX3, sumX4]
    ];
    
    const vector = [sumY, sumXY, sumX2Y];
    
    for (let i = 0; i < 3; i++) {
      const pivot = matrix[i][i];
      if (Math.abs(pivot) < 1e-10) continue;
      
      for (let j = i + 1; j < 3; j++) {
        const factor = matrix[j][i] / pivot;
        for (let k = i; k < 3; k++) {
          matrix[j][k] -= factor * matrix[i][k];
        }
        vector[j] -= factor * vector[i];
      }
    }
    
    const coeffs = new Array(3).fill(0);
    for (let i = 2; i >= 0; i--) {
      let sum = vector[i];
      for (let j = i + 1; j < 3; j++) {
        sum -= matrix[i][j] * coeffs[j];
      }
      coeffs[i] = sum / matrix[i][i];
    }
    
    const [a, b, c] = coeffs;

    // Calcular el error estándar para la curva
    const residuals = points.map(p => {
      const predicted = a + b * p.x + c * p.x * p.x;
      return p.y - predicted;
    });
    
    const RSS = sum(residuals.map(r => r * r));
    const MSE = RSS / (n - 3); // n-3 grados de libertad para regresión cuadrática
    const SE = sqrt(MSE);
    
    // Generar puntos para la curva y las bandas
    const curvePoints = [];
    const upperBand = [];
    const lowerBand = [];
    
    for (let i = 0; i <= 100; i++) {
      const x = i / 10;
      const y = a + b * x + c * x * x;
      
      // Factor de ajuste para las bandas de confianza
      const adjustmentFactor = 1.96 * SE * sqrt(1 + 1/n + Math.pow(x - meanX, 2)/sumX2);
      
      curvePoints.push(`${x * 40},${y * 40}`);
      upperBand.push(`${x * 40},${(y + adjustmentFactor) * 40}`);
      lowerBand.push(`${x * 40},${(y - adjustmentFactor) * 40}`);
    }
    
    return {
      curve: curvePoints.join(' '),
      confidenceBands: upperBand.concat(lowerBand.reverse()).join(' ')
    };
  };

  const calculateRegression = () => {
    const n = points.length;
    const meanX = mean(points.map(p => p.x));
    const meanY = mean(points.map(p => p.y));
    const ssxx = sum(points.map(p => Math.pow(p.x - meanX, 2)));
    const ssxy = sum(points.map(p => (p.x - meanX) * (p.y - meanY)));
    const slope = ssxy / ssxx;
    const intercept = meanY - slope * meanX;

    const predictedY = points.map(p => slope * p.x + intercept);
    const residuals = points.map((p, i) => p.y - predictedY[i]);
    const RSS = sum(residuals.map(r => r * r));
    const MSE = RSS / (n - 2);
    const SE = sqrt(MSE);

    const xRange = Array.from({length: 101}, (_, i) => i / 10);
    const bands = xRange.map(x => {
      const SE_fit = SE * sqrt(1/n + Math.pow(x - meanX, 2)/ssxx);
      const yFit = slope * x + intercept;
      return {
        x,
        yLower: yFit - 1.96 * SE_fit,
        yUpper: yFit + 1.96 * SE_fit,
        yFit
      };
    });

    return { slope, intercept, bands };
  };

  const { slope, intercept, bands } = calculateRegression();
  const { curve, confidenceBands } = generateCurvePoints();

  useEffect(() => {
    const meanX = mean(points.map(p => p.x));
    const meanY = mean(points.map(p => p.y));
    const ssxx = sum(points.map(p => Math.pow(p.x - meanX, 2)));
    const ssyy = sum(points.map(p => Math.pow(p.y - meanY, 2)));
    const ssxy = sum(points.map(p => (p.x - meanX) * (p.y - meanY)));
    const correlation = ssxy / Math.sqrt(ssxx * ssyy);
    const r2 = Math.pow(correlation, 2);
    setStats({
      r2: round(r2, 3),
      correlation: round(correlation, 3)
    });
  }, [points]);

  const generateConfidenceBandPath = () => {
    if (viewType === 'curve') {
      const points = confidenceBands.split(' ');
      const middle = points.length / 2;
      const upper = points.slice(0, middle);
      const lower = points.slice(middle);
      return `M ${upper[0]} L ${upper.join(' L ')} L ${lower.join(' L ')} Z`;
    }
    const upper = bands.map((b, i) => `${i === 0 ? 'M' : 'L'} ${b.x * 40} ${b.yUpper * 40}`).join(' ');
    const lower = bands.reverse().map(b => `L ${b.x * 40} ${b.yLower * 40}`).join(' ');
    return upper + ' ' + lower + ' Z';
  };

  const startDragging = (index, e) => {
    e.preventDefault();
    setDraggingIndex(index);
  };

  const onDrag = (e) => {
    if (draggingIndex === null) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 10;
    const y = 10 - ((e.clientY - rect.top) / rect.height) * 10;
    
    setPoints(points.map((p, i) => {
      if (i === draggingIndex) {
        return {
          x: Math.max(0, Math.min(10, round(x, 1))),
          y: Math.max(0, Math.min(10, round(y, 1)))
        };
      }
      return p;
    }));
  };

  const stopDragging = () => {
    setDraggingIndex(null);
  };

  const detectOutliers = () => {
    const residuals = points.map(point => {
      const expectedY = slope * point.x + intercept;
      return Math.abs(point.y - expectedY);
    });

    const sorted = [...residuals].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const upperBound = q3 + 1.5 * iqr;

    return residuals.map(residual => residual > upperBound);
  };

  const outliers = detectOutliers();

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex space-x-4 mb-4">
        <button 
          className={`px-3 py-1 rounded ${viewType === 'curve' ? 'bg-blue-900 text-white' : 'border'}`}
          onClick={() => setViewType('curve')}
        >
          Curva
        </button>
        <button 
          className={`px-3 py-1 rounded ${viewType === 'linear' ? 'bg-blue-900 text-white' : 'border'}`}
          onClick={() => setViewType('linear')}
        >
          Lineal
        </button>
        <button 
          className={`px-3 py-1 rounded ${showResiduals ? 'bg-blue-900 text-white' : 'border'}`}
          onClick={() => setShowResiduals(!showResiduals)}
        >
          Ver Residuos
        </button>
      </div>

      <div className="flex flex-col space-y-4 mb-4 w-full max-w-2xl">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="font-medium mb-2">Ecuación de regresión:</p>
          {viewType === 'linear' ? (
            <p>$y = {slope.toFixed(3)}x {intercept >= 0 ? '+' : '-'} {Math.abs(intercept).toFixed(3)}$</p>
          ) : (
            (() => {
              const xs = points.map(p => p.x);
              const ys = points.map(p => p.y);
              const n = points.length;
              
              const sumX = sum(xs);
              const sumY = sum(ys);
              const sumXY = sum(xs.map((x, i) => x * ys[i]));
              const sumX2 = sum(xs.map(x => x * x));
              const sumX3 = sum(xs.map(x => x * x * x));
              const sumX4 = sum(xs.map(x => x * x * x * x));
              const sumX2Y = sum(xs.map((x, i) => x * x * ys[i]));
              
              const matrix = [
                [n, sumX, sumX2],
                [sumX, sumX2, sumX3],
                [sumX2, sumX3, sumX4]
              ];
              
              const vector = [sumY, sumXY, sumX2Y];
              
              for (let i = 0; i < 3; i++) {
                const pivot = matrix[i][i];
                if (Math.abs(pivot) < 1e-10) continue;
                
                for (let j = i + 1; j < 3; j++) {
                  const factor = matrix[j][i] / pivot;
                  for (let k = i; k < 3; k++) {
                    matrix[j][k] -= factor * matrix[i][k];
                  }
                  vector[j] -= factor * vector[i];
                }
              }
              
              const coeffs = new Array(3).fill(0);
              for (let i = 2; i >= 0; i--) {
                let sum = vector[i];
                for (let j = i + 1; j < 3; j++) {
                  sum -= matrix[i][j] * coeffs[j];
                }
                coeffs[i] = sum / matrix[i][i];
              }
              
              const [a, b, c] = coeffs;
              return (
                <p>$y = {c.toFixed(3)}x^2 {b >= 0 ? '+' : '-'} {Math.abs(b).toFixed(3)}x {a >= 0 ? '+' : '-'} {Math.abs(a).toFixed(3)}$</p>
              );
            })()
          )}
        </div>
        
        <div className="flex justify-between space-x-8">
          <div className="flex items-center">
            <span className="font-semibold">R² = {stats.r2}</span>
            <button 
              className="ml-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowR2Info(!showR2Info)}
            >
              ⓘ
            </button>
          </div>
          <div className="flex items-center">
            <span className="font-semibold">Correlación = {stats.correlation}</span>
            <button 
              className="ml-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowCorrelationInfo(!showCorrelationInfo)}
            >
              ⓘ
            </button>
          </div>
          <div className="flex items-center">
            <span className="font-semibold">Outliers = {outliers.filter(x => x).length}</span>
            <button 
              className="ml-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowOutlierInfo(!showOutlierInfo)}
            >
              ⓘ
            </button>
          </div>
        </div>
        
        {showR2Info && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p>R² (coeficiente de determinación) indica qué porcentaje de la variabilidad en Y 
            se explica por X. Un R² de {stats.r2} significa que el {(stats.r2 * 100).toFixed(1)}% 
            de la variación se explica por este modelo.</p>
          </div>
        )}
        
        {showCorrelationInfo && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p>La correlación ({stats.correlation}) mide la fuerza y dirección de la relación lineal.
            Varía entre -1 y +1, donde ±1 indica correlación perfecta y 0 ninguna correlación lineal.</p>
          </div>
        )}
        
        {showOutlierInfo && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p>Los outliers son puntos que se desvían significativamente del patrón general.
            Se identifican usando el rango intercuartílico (IQR) y se marcan en rojo.</p>
          </div>
        )}
      </div>

      <svg 
        width="400" 
        height="400" 
        viewBox="0 0 400 400" 
        className="border"
        onMouseMove={onDrag}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        <g transform="translate(0, 400) scale(1, -1)">
          {[...Array(11)].map((_, i) => (
            <g key={i}>
              <line
                x1={i * 40}
                y1={0}
                x2={i * 40}
                y2={400}
                stroke="#eee"
                strokeWidth="1"
              />
              <line
                x1={0}
                y1={i * 40}
                x2={400}
                y2={i * 40}
                stroke="#eee"
                strokeWidth="1"
              />
            </g>
          ))}

          <path
            d={generateConfidenceBandPath()}
            fill="rgba(0, 0, 0, 0.1)"
            stroke="none"
          />

          {showResiduals && points.map((point, i) => {
            let predictedY;
            if (viewType === 'linear') {
              predictedY = slope * point.x + intercept;
            } else {
              const xs = points.map(p => p.x);
              const ys = points.map(p => p.y);
              const n = points.length;
              
              const sumX = sum(xs);
              const sumY = sum(ys);
              const sumXY = sum(xs.map((x, i) => x * ys[i]));
              const sumX2 = sum(xs.map(x => x * x));
              const sumX3 = sum(xs.map(x => x * x * x));
              const sumX4 = sum(xs.map(x => x * x * x * x));
              const sumX2Y = sum(xs.map((x, i) => x * x * ys[i]));
              
              const matrix = [
                [n, sumX, sumX2],
                [sumX, sumX2, sumX3],
                [sumX2, sumX3, sumX4]
              ];
              
              const vector = [sumY, sumXY, sumX2Y];
              
              // Solve system using Gaussian elimination
              for (let i = 0; i < 3; i++) {
                const pivot = matrix[i][i];
                if (Math.abs(pivot) < 1e-10) continue;
                
                for (let j = i + 1; j < 3; j++) {
                  const factor = matrix[j][i] / pivot;
                  for (let k = i; k < 3; k++) {
                    matrix[j][k] -= factor * matrix[i][k];
                  }
                  vector[j] -= factor * vector[i];
                }
              }
              
              const coeffs = new Array(3).fill(0);
              for (let i = 2; i >= 0; i--) {
                let sum = vector[i];
                for (let j = i + 1; j < 3; j++) {
                  sum -= matrix[i][j] * coeffs[j];
                }
                coeffs[i] = sum / matrix[i][i];
              }
              
              const [a, b, c] = coeffs;
              predictedY = a + b * point.x + c * point.x * point.x;
            }
            
            return (
              <line
                key={`residual-${i}`}
                x1={point.x * 40}
                y1={point.y * 40}
                x2={point.x * 40}
                y2={predictedY * 40}
                stroke="rgba(255, 0, 0, 0.3)"
                strokeWidth="2"
                strokeDasharray="4"
              />
            );
          })}

          {viewType === 'linear' ? (
            <line
              x1={0}
              y1={intercept * 40}
              x2={400}
              y2={(slope * 10 + intercept) * 40}
              stroke="black"
              strokeWidth="2"
            />
          ) : (
            <polyline
              points={curve}
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
          )}

          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x * 40}
              cy={point.y * 40}
              r="6"
              stroke="rgb(236, 72, 153)"
              strokeWidth="2"
              fill={outliers[i] ? "rgb(239, 68, 68)" : (draggingIndex === i ? "rgb(236, 72, 153)" : "white")}
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => startDragging(i, e)}
            />
          ))}
        </g>
      </svg>

      <p className="text-gray-600 mt-4 text-center italic">
        Un gráfico de dispersión interactivo con línea de regresión.
        <br />
        ¡Arrastra los círculos para ver el impacto en el R²!
        <br />
        Los puntos rojos indican valores atípicos y el área sombreada muestra el error estándar.
      </p>
    </div>
  );
}