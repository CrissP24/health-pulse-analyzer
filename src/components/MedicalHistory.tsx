import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patient, MedicalRecord } from '@/types/patient';
import { getChildBMICategoryInfo } from '@/utils/bmi';
import { Calendar, User, FileText, TrendingUp } from 'lucide-react';

interface MedicalHistoryProps {
  patient: Patient;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ patient }) => {
  const getCategoryColor = (category: string) => {
    const categoryInfo = getChildBMICategoryInfo(category as any);
    return categoryInfo?.color || '#6b7280';
  };

  const getCategoryLabel = (category: string) => {
    const categoryInfo = getChildBMICategoryInfo(category as any);
    return categoryInfo?.label || category;
  };

  const medicalHistory = patient.medicalHistory || [];

  if (medicalHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay registros médicos para este paciente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Historial Médico - {patient.fullName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Registros Totales</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{medicalHistory.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Último Registro</span>
              </div>
              <p className="text-sm text-green-600">
                {new Date(medicalHistory[0]?.date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Último IMC</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {medicalHistory[0]?.bmi} kg/m²
              </p>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>Estatura (cm)</TableHead>
                  <TableHead>IMC</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Percentil</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{record.weight}</TableCell>
                    <TableCell className="font-medium">{record.height}</TableCell>
                    <TableCell className="font-bold text-cyan-600">
                      {record.bmi} kg/m²
                    </TableCell>
                    <TableCell>
                      <Badge 
                        style={{ backgroundColor: getCategoryColor(record.bmiCategory) }}
                        className="text-white"
                      >
                        {getCategoryLabel(record.bmiCategory)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.percentile}%
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {record.doctorName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {record.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalHistory;
