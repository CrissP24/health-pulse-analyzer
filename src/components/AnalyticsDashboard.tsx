import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Patient, BMIDistribution, GenderBMIAverage } from '@/types/patient';
import { getBMICategoryInfo } from '@/utils/bmi';
import { BarChart3, PieChart as PieChartIcon, Users, TrendingUp } from 'lucide-react';

interface AnalyticsDashboardProps {
  patients: Patient[];
}

export default function AnalyticsDashboard({ patients }: AnalyticsDashboardProps) {
  // BMI Distribution
  const bmiDistribution: BMIDistribution[] = [
    { category: 'underweight', count: 0, percentage: 0 },
    { category: 'normal', count: 0, percentage: 0 },
    { category: 'overweight', count: 0, percentage: 0 },
    { category: 'obesity', count: 0, percentage: 0 },
  ];

  patients.forEach(patient => {
    const dist = bmiDistribution.find(d => d.category === patient.bmiCategory);
    if (dist) dist.count++;
  });

  bmiDistribution.forEach(dist => {
    dist.percentage = patients.length > 0 ? (dist.count / patients.length) * 100 : 0;
  });

  // Gender BMI Average
  const genderStats: GenderBMIAverage[] = ['male', 'female', 'other'].map(gender => {
    const genderPatients = patients.filter(p => p.gender === gender);
    const averageBMI = genderPatients.length > 0
      ? genderPatients.reduce((sum, p) => sum + p.bmi, 0) / genderPatients.length
      : 0;
    
    return {
      gender: gender === 'male' ? 'Masculino' : gender === 'female' ? 'Femenino' : 'Otro',
      averageBMI: parseFloat(averageBMI.toFixed(1)),
      count: genderPatients.length,
    };
  }).filter(stat => stat.count > 0);

  // Age distribution
  const ageRanges = [
    { range: '18-25', min: 18, max: 25 },
    { range: '26-35', min: 26, max: 35 },
    { range: '36-45', min: 36, max: 45 },
    { range: '46-55', min: 46, max: 55 },
    { range: '56-65', min: 56, max: 65 },
    { range: '65+', min: 66, max: 120 },
  ];

  const ageDistribution = ageRanges.map(range => ({
    range: range.range,
    count: patients.filter(p => p.age >= range.min && p.age <= range.max).length,
  })).filter(dist => dist.count > 0);

  const COLORS = {
    underweight: '#3b82f6',
    normal: '#10b981',
    overweight: '#f59e0b',
    obesity: '#ef4444',
  };

  const pieData = bmiDistribution
    .filter(d => d.count > 0)
    .map(d => ({
      name: getBMICategoryInfo(d.category).label,
      value: d.count,
      color: COLORS[d.category],
      percentage: d.percentage,
    }));

  const totalPatients = patients.length;
  const averageAge = totalPatients > 0 ? patients.reduce((sum, p) => sum + p.age, 0) / totalPatients : 0;
  const averageBMI = totalPatients > 0 ? patients.reduce((sum, p) => sum + p.bmi, 0) / totalPatients : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pacientes</p>
                <p className="text-2xl font-bold">{totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IMC Promedio</p>
                <p className="text-2xl font-bold">{averageBMI.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Edad Promedio</p>
                <p className="text-2xl font-bold">{averageAge.toFixed(0)} años</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <PieChartIcon className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Normal</p>
                <p className="text-2xl font-bold">
                  {bmiDistribution.find(d => d.category === 'normal')?.percentage.toFixed(0) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI Distribution Pie Chart */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribución por Categoría de IMC
            </CardTitle>
            <CardDescription>
              Porcentaje de pacientes en cada categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, 'Pacientes']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* BMI by Gender */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              IMC Promedio por Género
            </CardTitle>
            <CardDescription>
              Comparación del IMC promedio entre géneros
            </CardDescription>
          </CardHeader>
          <CardContent>
            {genderStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="gender" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === 'averageBMI' ? `${value} kg/m²` : value,
                        name === 'averageBMI' ? 'IMC Promedio' : 'Cantidad'
                      ]}
                    />
                    <Bar dataKey="averageBMI" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Age Distribution */}
      <Card className="shadow-medical">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribución por Edad
          </CardTitle>
          <CardDescription>
            Número de pacientes por rango de edad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ageDistribution.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [value, 'Pacientes']} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No hay datos para mostrar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}