import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient, MedicalRecord } from '@/types/patient';
import { CHILD_BMI_TABLE } from '@/utils/bmi';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface WeightTrackingChartProps {
  patient: Patient;
}

const WeightTrackingChart: React.FC<WeightTrackingChartProps> = ({ patient }) => {
  const medicalHistory = patient.medicalHistory || [];
  
  if (medicalHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Seguimiento de Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay datos suficientes para mostrar el gráfico</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get reference values for the patient's age
  const getReferenceValues = (age: number) => {
    const ageData = CHILD_BMI_TABLE.find(data => data.age === age);
    if (!ageData) return null;
    
    return {
      bajoPeso: ageData.bajoPeso,
      riesgoDesnutricion: ageData.riesgoDesnutricion,
      pesoSaludable: ageData.pesoSaludable,
      sobrepeso: ageData.sobrepeso
    };
  };

  const referenceValues = getReferenceValues(patient.age);
  if (!referenceValues) return null;

  // Sort medical history by date
  const sortedHistory = [...medicalHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate chart dimensions
  const chartWidth = 800;
  const chartHeight = 400;
  const padding = 60;
  const chartAreaWidth = chartWidth - (padding * 2);
  const chartAreaHeight = chartHeight - (padding * 2);

  // Find min and max BMI values for scaling
  const allBMIs = sortedHistory.map(record => record.bmi);
  const minBMI = Math.min(...allBMIs, referenceValues.bajoPeso) - 1;
  const maxBMI = Math.max(...allBMIs, referenceValues.sobrepeso) + 1;
  const bmiRange = maxBMI - minBMI;

  // Convert BMI to chart coordinates
  const bmiToY = (bmi: number) => {
    return padding + chartAreaHeight - ((bmi - minBMI) / bmiRange) * chartAreaHeight;
  };

  // Convert date to chart coordinates
  const dateToX = (date: string, index: number) => {
    return padding + (index / (sortedHistory.length - 1)) * chartAreaWidth;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Seguimiento de Peso - {patient.fullName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="overflow-x-auto">
            <svg width={chartWidth} height={chartHeight} className="border rounded-lg">
              {/* Reference lines */}
              <line
                x1={padding}
                y1={bmiToY(referenceValues.bajoPeso)}
                x2={chartWidth - padding}
                y2={bmiToY(referenceValues.bajoPeso)}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text
                x={chartWidth - padding + 10}
                y={bmiToY(referenceValues.bajoPeso) + 5}
                fontSize="12"
                fill="#3b82f6"
              >
                Bajo peso ({referenceValues.bajoPeso})
              </text>

              <line
                x1={padding}
                y1={bmiToY(referenceValues.riesgoDesnutricion.max)}
                x2={chartWidth - padding}
                y2={bmiToY(referenceValues.riesgoDesnutricion.max)}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text
                x={chartWidth - padding + 10}
                y={bmiToY(referenceValues.riesgoDesnutricion.max) + 5}
                fontSize="12"
                fill="#f59e0b"
              >
                Riesgo desnutrición ({referenceValues.riesgoDesnutricion.max})
              </text>

              <line
                x1={padding}
                y1={bmiToY(referenceValues.pesoSaludable.max)}
                x2={chartWidth - padding}
                y2={bmiToY(referenceValues.pesoSaludable.max)}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text
                x={chartWidth - padding + 10}
                y={bmiToY(referenceValues.pesoSaludable.max) + 5}
                fontSize="12"
                fill="#10b981"
              >
                Peso saludable ({referenceValues.pesoSaludable.max})
              </text>

              <line
                x1={padding}
                y1={bmiToY(referenceValues.sobrepeso)}
                x2={chartWidth - padding}
                y2={bmiToY(referenceValues.sobrepeso)}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text
                x={chartWidth - padding + 10}
                y={bmiToY(referenceValues.sobrepeso) + 5}
                fontSize="12"
                fill="#ef4444"
              >
                Sobrepeso ({referenceValues.sobrepeso})
              </text>

              {/* BMI data points and line */}
              {sortedHistory.map((record, index) => {
                const x = dateToX(record.date, index);
                const y = bmiToY(record.bmi);
                
                return (
                  <g key={record.id}>
                    {/* Data point */}
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#06b6d4"
                      stroke="white"
                      strokeWidth="2"
                    />
                    
                    {/* BMI value label */}
                    <text
                      x={x}
                      y={y - 15}
                      fontSize="10"
                      fill="#06b6d4"
                      textAnchor="middle"
                    >
                      {record.bmi}
                    </text>
                    
                    {/* Date label */}
                    <text
                      x={x}
                      y={chartHeight - 10}
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
                  points={sortedHistory.map((record, index) => 
                    `${dateToX(record.date, index)},${bmiToY(record.bmi)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
              )}

              {/* Y-axis labels */}
              <text
                x={10}
                y={padding + chartAreaHeight / 2}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
                transform={`rotate(-90, 10, ${padding + chartAreaHeight / 2})`}
              >
                IMC (kg/m²)
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300"></div>
              <span>Bajo peso (&lt; {referenceValues.bajoPeso})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300"></div>
              <span>Riesgo desnutrición</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300"></div>
              <span>Peso saludable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300"></div>
              <span>Sobrepeso (&gt; {referenceValues.sobrepeso})</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
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

export default WeightTrackingChart;
