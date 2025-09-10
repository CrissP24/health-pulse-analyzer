import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient, MedicalRecord } from '@/types/patient';
import { TrendingUp, Users } from 'lucide-react';

interface GrowthChartProps {
  patient: Patient;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ patient }) => {
  const medicalHistory = patient.medicalHistory || [];
  
  if (medicalHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Gráfico de Crecimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay datos suficientes para mostrar el gráfico de crecimiento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // WHO Growth Standards for BMI-for-age (3-5 years)
  const whoStandards = {
    boys: {
      3: { p3: 13.4, p15: 14.2, p50: 15.2, p85: 16.3, p97: 17.3 },
      4: { p3: 13.1, p15: 13.9, p50: 14.8, p85: 15.9, p97: 17.0 },
      5: { p3: 12.9, p15: 13.7, p50: 14.5, p85: 15.6, p97: 16.8 }
    },
    girls: {
      3: { p3: 13.0, p15: 13.8, p50: 14.8, p85: 16.0, p97: 17.2 },
      4: { p3: 12.8, p15: 13.6, p50: 14.5, p85: 15.7, p97: 16.9 },
      5: { p3: 12.6, p15: 13.4, p50: 14.3, p85: 15.5, p97: 16.7 }
    }
  };

  const isBoy = patient.gender === 'male';
  const standards = isBoy ? whoStandards.boys : whoStandards.girls;
  const chartColor = isBoy ? '#3b82f6' : '#ec4899'; // Blue for boys, pink for girls
  const bgColor = isBoy ? '#dbeafe' : '#fce7f3'; // Light blue for boys, light pink for girls

  // Sort medical history by date
  const sortedHistory = [...medicalHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate chart dimensions
  const chartWidth = 800;
  const chartHeight = 500;
  const padding = 80;
  const chartAreaWidth = chartWidth - (padding * 2);
  const chartAreaHeight = chartHeight - (padding * 2);

  // Find min and max BMI values for scaling
  const allBMIs = sortedHistory.map(record => record.bmi);
  const minBMI = Math.min(...allBMIs, 12, 13) - 0.5;
  const maxBMI = Math.max(...allBMIs, 16, 17) + 0.5;
  const bmiRange = maxBMI - minBMI;

  // Convert BMI to chart coordinates
  const bmiToY = (bmi: number) => {
    return padding + chartAreaHeight - ((bmi - minBMI) / bmiRange) * chartAreaHeight;
  };

  // Convert age to chart coordinates
  const ageToX = (age: number) => {
    const minAge = 3;
    const maxAge = 5;
    const ageRange = maxAge - minAge;
    return padding + ((age - minAge) / ageRange) * chartAreaWidth;
  };

  // Generate WHO percentile curves
  const generatePercentileCurve = (percentile: 'p3' | 'p15' | 'p50' | 'p85' | 'p97', color: string, isDashed = false) => {
    const points = [];
    for (let age = 3; age <= 5; age += 0.1) {
      const standard = standards[Math.floor(age) as keyof typeof standards];
      if (standard) {
        const bmi = standard[percentile];
        const x = ageToX(age);
        const y = bmiToY(bmi);
        points.push(`${x},${y}`);
      }
    }
    
    return (
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={percentile === 'p50' ? 3 : 2}
        strokeDasharray={isDashed ? "5,5" : "none"}
        opacity={percentile === 'p50' ? 1 : 0.7}
      />
    );
  };

  return (
    <Card>
      <CardHeader className={`${bgColor} rounded-t-lg`}>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Gráfico de Crecimiento - {patient.fullName}
        </CardTitle>
        <p className="text-sm text-gray-600">
          IMC para la edad - {isBoy ? 'NIÑOS' : 'NIÑAS'} (3-5 años) - Patrones de crecimiento de la OMS
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Chart */}
          <div className="overflow-x-auto">
            <svg width={chartWidth} height={chartHeight} className="border rounded-lg bg-white">
              {/* Grid lines */}
              {Array.from({ length: 6 }, (_, i) => {
                const y = padding + (i * chartAreaHeight) / 5;
                return (
                  <line
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}
              
              {Array.from({ length: 6 }, (_, i) => {
                const x = padding + (i * chartAreaWidth) / 5;
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={chartHeight - padding}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}

              {/* WHO Percentile Curves */}
              {generatePercentileCurve('p3', '#ef4444')}
              {generatePercentileCurve('p15', '#f59e0b')}
              {generatePercentileCurve('p50', '#10b981', true)}
              {generatePercentileCurve('p85', '#f59e0b')}
              {generatePercentileCurve('p97', '#ef4444')}

              {/* Patient data points */}
              {sortedHistory.map((record, index) => {
                const x = ageToX(patient.age);
                const y = bmiToY(record.bmi);
                
                return (
                  <g key={record.id}>
                    {/* Data point */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={chartColor}
                      stroke="white"
                      strokeWidth="3"
                    />
                    
                    {/* BMI value label */}
                    <text
                      x={x}
                      y={y - 15}
                      fontSize="12"
                      fill={chartColor}
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {record.bmi}
                    </text>
                    
                    {/* Date label */}
                    <text
                      x={x}
                      y={chartHeight - 20}
                      fontSize="10"
                      fill="#6b7280"
                      textAnchor="middle"
                    >
                      {new Date(record.date).toLocaleDateString('es-ES', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </text>
                  </g>
                );
              })}

              {/* Connect points with line */}
              {sortedHistory.length > 1 && (
                <polyline
                  points={sortedHistory.map((record) => 
                    `${ageToX(patient.age)},${bmiToY(record.bmi)}`
                  ).join(' ')}
                  fill="none"
                  stroke={chartColor}
                  strokeWidth="3"
                  strokeDasharray="none"
                />
              )}

              {/* Y-axis labels */}
              <text
                x={20}
                y={padding + chartAreaHeight / 2}
                fontSize="14"
                fill="#374151"
                textAnchor="middle"
                transform={`rotate(-90, 20, ${padding + chartAreaHeight / 2})`}
                fontWeight="bold"
              >
                IMC (kg/m²)
              </text>

              {/* X-axis labels */}
              <text
                x={chartWidth / 2}
                y={chartHeight - 20}
                fontSize="14"
                fill="#374151"
                textAnchor="middle"
                fontWeight="bold"
              >
                Edad (años)
              </text>

              {/* Y-axis values */}
              {Array.from({ length: 6 }, (_, i) => {
                const bmi = minBMI + (i * bmiRange) / 5;
                const y = padding + chartAreaHeight - (i * chartAreaHeight) / 5;
                return (
                  <text
                    key={i}
                    x={padding - 10}
                    y={y + 5}
                    fontSize="12"
                    fill="#6b7280"
                    textAnchor="end"
                  >
                    {bmi.toFixed(1)}
                  </text>
                );
              })}

              {/* X-axis values */}
              {Array.from({ length: 3 }, (_, i) => {
                const age = 3 + i;
                const x = ageToX(age);
                return (
                  <text
                    key={i}
                    x={x}
                    y={chartHeight - padding + 20}
                    fontSize="12"
                    fill="#6b7280"
                    textAnchor="middle"
                  >
                    {age}
                  </text>
                );
              })}

              {/* Percentile labels */}
              <text x={chartWidth - 60} y={bmiToY(standards[3].p3) + 5} fontSize="10" fill="#ef4444" textAnchor="end">P3</text>
              <text x={chartWidth - 60} y={bmiToY(standards[3].p15) + 5} fontSize="10" fill="#f59e0b" textAnchor="end">P15</text>
              <text x={chartWidth - 60} y={bmiToY(standards[3].p50) + 5} fontSize="10" fill="#10b981" textAnchor="end">P50</text>
              <text x={chartWidth - 60} y={bmiToY(standards[3].p85) + 5} fontSize="10" fill="#f59e0b" textAnchor="end">P85</text>
              <text x={chartWidth - 60} y={bmiToY(standards[3].p97) + 5} fontSize="10" fill="#ef4444" textAnchor="end">P97</text>
            </svg>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500"></div>
              <span>P3 - P97</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-yellow-500"></div>
              <span>P15 - P85</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-500" style={{borderStyle: 'dashed'}}></div>
              <span>P50 (Mediana)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{backgroundColor: chartColor}}></div>
              <span>Datos del paciente</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" style={{color: chartColor}} />
              <span>{isBoy ? 'Niño' : 'Niña'}</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{color: chartColor}}>
                {sortedHistory[0]?.bmi || 0}
              </div>
              <div className="text-sm text-gray-600">IMC Actual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sortedHistory.length}
              </div>
              <div className="text-sm text-gray-600">Registros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sortedHistory.length > 1 ? 
                  (sortedHistory[sortedHistory.length - 1].bmi - sortedHistory[0].bmi).toFixed(1) : 
                  '0'
                }
              </div>
              <div className="text-sm text-gray-600">Cambio IMC</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
