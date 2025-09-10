import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Patient, MedicalRecord } from '@/types/patient';
import { Appointment } from '@/types/user';
import { getChildBMICategoryInfo } from '@/utils/bmi';
import { FileText, Download, BarChart3, PieChart, TrendingUp, Users, Calendar } from 'lucide-react';

interface ReportsProps {
  patients: Patient[];
  appointments: Appointment[];
}

const Reports: React.FC<ReportsProps> = ({ patients, appointments }) => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  // Calculate statistics
  const totalPatients = patients.length;
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled').length;

  // BMI statistics
  const allMedicalRecords = patients.flatMap(p => p.medicalHistory || []);
  const bmiCategories = allMedicalRecords.reduce((acc, record) => {
    acc[record.bmiCategory] = (acc[record.bmiCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageGroups = patients.reduce((acc, patient) => {
    const ageGroup = patient.age < 5 ? '3-4' : patient.age < 7 ? '5-6' : patient.age < 9 ? '7-8' : '9-10';
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const generatePDFReport = () => {
    // This would generate a PDF report
    // For now, we'll just show a success message
    alert('Reporte PDF generado exitosamente');
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold">{totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Citas Totales</p>
                <p className="text-2xl font-bold">{totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Citas Completadas</p>
                <p className="text-2xl font-bold">{completedAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Registros IMC</p>
                <p className="text-2xl font-bold">{allMedicalRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BMI Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribución de Categorías de IMC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(bmiCategories).map(([category, count]) => {
              const categoryInfo = getChildBMICategoryInfo(category as any);
              const percentage = allMedicalRecords.length > 0 ? (count / allMedicalRecords.length) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: categoryInfo?.color || '#6b7280' }}
                    ></div>
                    <span className="font-medium">{categoryInfo?.label || category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: categoryInfo?.color || '#6b7280'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Age Groups Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribución por Grupos de Edad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(ageGroups).map(([ageGroup, count]) => {
              const percentage = totalPatients > 0 ? (count / totalPatients) * 100 : 0;
              
              return (
                <div key={ageGroup} className="flex items-center justify-between">
                  <span className="font-medium">{ageGroup} años</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-cyan-600"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPatientReport = () => {
    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Selecciona un paciente para ver su reporte</p>
        </div>
      );
    }

    const medicalHistory = patient.medicalHistory || [];
    const latestRecord = medicalHistory[0];
    const firstRecord = medicalHistory[medicalHistory.length - 1];

    return (
      <div className="space-y-6">
        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Nombre:</strong> {patient.fullName}</p>
                <p><strong>Cédula:</strong> {patient.cedula}</p>
                <p><strong>Edad:</strong> {patient.age} años</p>
                <p><strong>Género:</strong> {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}</p>
              </div>
              <div>
                <p><strong>Teléfono:</strong> {patient.phone}</p>
                <p><strong>Dirección:</strong> {patient.address}</p>
                <p><strong>Contacto de emergencia:</strong> {patient.emergencyContact}</p>
                <p><strong>Teléfono de emergencia:</strong> {patient.emergencyPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMI Summary */}
        {latestRecord && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen de IMC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-600">
                    {latestRecord.bmi} kg/m²
                  </div>
                  <div className="text-sm text-gray-600">IMC Actual</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {medicalHistory.length}
                  </div>
                  <div className="text-sm text-gray-600">Registros Totales</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {firstRecord ? (latestRecord.bmi - firstRecord.bmi).toFixed(1) : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Cambio IMC</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medical History Table */}
        {medicalHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historial Médico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Fecha</th>
                      <th className="text-left p-2">Peso</th>
                      <th className="text-left p-2">Estatura</th>
                      <th className="text-left p-2">IMC</th>
                      <th className="text-left p-2">Categoría</th>
                      <th className="text-left p-2">Percentil</th>
                      <th className="text-left p-2">Doctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalHistory.map((record) => {
                      const categoryInfo = getChildBMICategoryInfo(record.bmiCategory as any);
                      return (
                        <tr key={record.id} className="border-b">
                          <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-2">{record.weight} kg</td>
                          <td className="p-2">{record.height} cm</td>
                          <td className="p-2 font-bold">{record.bmi} kg/m²</td>
                          <td className="p-2">
                            <span 
                              className="px-2 py-1 rounded text-white text-xs"
                              style={{ backgroundColor: categoryInfo?.color || '#6b7280' }}
                            >
                              {categoryInfo?.label || record.bmiCategory}
                            </span>
                          </td>
                          <td className="p-2">{record.percentile}%</td>
                          <td className="p-2">{record.doctorName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">REPORTES</h1>
                <p className="text-cyan-100">Generación de reportes y estadísticas</p>
              </div>
            </div>
            <Button 
              onClick={generatePDFReport}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Generar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Tipo de Reporte</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Reporte General</SelectItem>
                  <SelectItem value="patient">Reporte Individual de Paciente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedReport === 'patient' && (
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Paciente</label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.fullName} - {patient.cedula}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {selectedReport === 'overview' ? renderOverviewReport() : renderPatientReport()}
    </div>
  );
};

export default Reports;
