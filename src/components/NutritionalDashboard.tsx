import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types/patient';
import { NutritionalStats, MonthlyEvolution, AgeGroupStats, GenderStats } from '@/types/nutrition';
import { loadStats, saveStats } from '@/utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, AlertTriangle, CheckCircle, Calendar, Filter } from 'lucide-react';

interface NutritionalDashboardProps {
  patients: Patient[];
}

const NutritionalDashboard: React.FC<NutritionalDashboardProps> = ({ patients }) => {
  const [stats, setStats] = useState<NutritionalStats | null>(null);
  const [filteredStats, setFilteredStats] = useState<NutritionalStats | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');

  // RF-2: Calcular estadísticas
  const calculateStats = (patients: Patient[]): NutritionalStats => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Contar por estado nutricional
    let redAlerts = 0;
    let yellowAlerts = 0;
    let greenStatus = 0;

    // Evolución mensual (últimos 6 meses)
    const monthlyEvolution: MonthlyEvolution[] = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthKey = month.toISOString().substring(0, 7);
      monthlyEvolution.push({
        month: monthKey,
        red: 0,
        yellow: 0,
        green: 0
      });
    }

    // Distribución por grupos etarios
    const ageGroups = ['3-5', '6-10', '11-17', '18+'];
    const ageGroupStats: AgeGroupStats[] = ageGroups.map(group => ({
      ageGroup: group,
      count: 0,
      redPercentage: 0,
      yellowPercentage: 0,
      greenPercentage: 0
    }));

    // Distribución por género
    const genderStats: GenderStats[] = [
      { gender: 'Masculino', count: 0, redPercentage: 0, yellowPercentage: 0, greenPercentage: 0 },
      { gender: 'Femenino', count: 0, redPercentage: 0, yellowPercentage: 0, greenPercentage: 0 }
    ];

    patients.forEach(patient => {
      if (!patient.medicalHistory || patient.medicalHistory.length === 0) return;

      const latestRecord = patient.medicalHistory[patient.medicalHistory.length - 1];
      const recordDate = new Date(latestRecord.measurementDate);
      const recordMonth = recordDate.toISOString().substring(0, 7);

      // Contar por estado
      switch (latestRecord.nutritionalStatus) {
        case 'red':
          redAlerts++;
          break;
        case 'yellow':
          yellowAlerts++;
          break;
        case 'green':
          greenStatus++;
          break;
      }

      // Evolución mensual
      const monthIndex = monthlyEvolution.findIndex(m => m.month === recordMonth);
      if (monthIndex !== -1) {
        switch (latestRecord.nutritionalStatus) {
          case 'red':
            monthlyEvolution[monthIndex].red++;
            break;
          case 'yellow':
            monthlyEvolution[monthIndex].yellow++;
            break;
          case 'green':
            monthlyEvolution[monthIndex].green++;
            break;
        }
      }

      // Grupos etarios
      const ageGroup = getAgeGroup(patient.age);
      const ageGroupIndex = ageGroupStats.findIndex(a => a.ageGroup === ageGroup);
      if (ageGroupIndex !== -1) {
        ageGroupStats[ageGroupIndex].count++;
        switch (latestRecord.nutritionalStatus) {
          case 'red':
            ageGroupStats[ageGroupIndex].redPercentage++;
            break;
          case 'yellow':
            ageGroupStats[ageGroupIndex].yellowPercentage++;
            break;
          case 'green':
            ageGroupStats[ageGroupIndex].greenPercentage++;
            break;
        }
      }

      // Género
      const genderIndex = patient.gender === 'male' ? 0 : 1;
      genderStats[genderIndex].count++;
      switch (latestRecord.nutritionalStatus) {
        case 'red':
          genderStats[genderIndex].redPercentage++;
          break;
        case 'yellow':
          genderStats[genderIndex].yellowPercentage++;
          break;
        case 'green':
          genderStats[genderIndex].greenPercentage++;
          break;
      }
    });

    // Calcular porcentajes
    ageGroupStats.forEach(group => {
      if (group.count > 0) {
        group.redPercentage = (group.redPercentage / group.count) * 100;
        group.yellowPercentage = (group.yellowPercentage / group.count) * 100;
        group.greenPercentage = (group.greenPercentage / group.count) * 100;
      }
    });

    genderStats.forEach(gender => {
      if (gender.count > 0) {
        gender.redPercentage = (gender.redPercentage / gender.count) * 100;
        gender.yellowPercentage = (gender.yellowPercentage / gender.count) * 100;
        gender.greenPercentage = (gender.greenPercentage / gender.count) * 100;
      }
    });

    return {
      totalPatients: patients.length,
      redAlerts,
      yellowAlerts,
      greenStatus,
      monthlyEvolution,
      ageGroupDistribution: ageGroupStats,
      genderDistribution: genderStats
    };
  };

  const getAgeGroup = (age: number): string => {
    if (age >= 3 && age <= 5) return '3-5';
    if (age >= 6 && age <= 10) return '6-10';
    if (age >= 11 && age <= 17) return '11-17';
    return '18+';
  };

  useEffect(() => {
    const calculatedStats = calculateStats(patients);
    setStats(calculatedStats);
    setFilteredStats(calculatedStats);
    saveStats(calculatedStats);
  }, [patients]);

  const COLORS = {
    red: '#ef4444',
    yellow: '#f59e0b',
    green: '#10b981'
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
  };

  if (!stats) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Panel de Estadísticas Nutricionales</h1>
              <p className="text-purple-100">Análisis completo del estado nutricional de los pacientes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  <SelectItem value="last3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="last6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="lastyear">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Género</label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Grupo Etario</label>
              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="3-5">3-5 años</SelectItem>
                  <SelectItem value="6-10">6-10 años</SelectItem>
                  <SelectItem value="11-17">11-17 años</SelectItem>
                  <SelectItem value="18+">18+ años</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold">{stats.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Rojas</p>
                <p className="text-2xl font-bold text-red-600">{stats.redAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Amarillas</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.yellowAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Estado Normal</p>
                <p className="text-2xl font-bold text-green-600">{stats.greenStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatMonth(value)}
                />
                <Line type="monotone" dataKey="red" stroke={COLORS.red} strokeWidth={2} name="Alertas Rojas" />
                <Line type="monotone" dataKey="yellow" stroke={COLORS.yellow} strokeWidth={2} name="Alertas Amarillas" />
                <Line type="monotone" dataKey="green" stroke={COLORS.green} strokeWidth={2} name="Estado Normal" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Alertas Rojas', value: stats.redAlerts, color: COLORS.red },
                    { name: 'Alertas Amarillas', value: stats.yellowAlerts, color: COLORS.yellow },
                    { name: 'Estado Normal', value: stats.greenStatus, color: COLORS.green }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Alertas Rojas', value: stats.redAlerts, color: COLORS.red },
                    { name: 'Alertas Amarillas', value: stats.yellowAlerts, color: COLORS.yellow },
                    { name: 'Estado Normal', value: stats.greenStatus, color: COLORS.green }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Grupos Etarios */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Grupos Etarios</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.ageGroupDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="redPercentage" fill={COLORS.red} name="Alertas Rojas %" />
              <Bar dataKey="yellowPercentage" fill={COLORS.yellow} name="Alertas Amarillas %" />
              <Bar dataKey="greenPercentage" fill={COLORS.green} name="Estado Normal %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionalDashboard;
