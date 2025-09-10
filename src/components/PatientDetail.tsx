import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Patient } from '@/types/patient';
import { User, Calendar, Phone, MapPin, ArrowLeft, FileText, Heart, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PDFExport from './PDFExport';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
}

export default function PatientDetail({ patient, onBack }: PatientDetailProps) {
  const historyData = patient.medicalHistory?.map((record, index) => ({
    index: index + 1,
    date: format(new Date(record.date), 'dd/MM/yy', { locale: es }),
    bmi: record.bmi,
    weight: record.weight,
  })) || [];

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Masculino';
      case 'female': return 'Femenino';
      case 'other': return 'Otro';
      default: return gender;
    }
  };

  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'bg-blue-100 text-blue-800';
      case 'female':
        return 'bg-pink-100 text-pink-800';
      case 'other':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista
        </Button>
        
        <PDFExport patients={[patient]} title={`Reporte Individual - ${patient.fullName}`} />
      </div>

      {/* Patient Info Card */}
      <Card className="shadow-medical">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {patient.fullName}
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Información detallada del paciente
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Edad</span>
              </div>
              <p className="text-2xl font-bold">{patient.age} años</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Género</span>
              </div>
              <Badge className={getGenderBadgeColor(patient.gender)}>
                {getGenderLabel(patient.gender)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Teléfono</span>
              </div>
              <p className="text-lg font-medium">{patient.phone}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Cédula</span>
              </div>
              <p className="text-lg font-mono">{patient.cedula}</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Dirección</span>
              </div>
              <p className="text-lg">{patient.address}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Fecha de registro</span>
              </div>
              <p className="text-lg">
                {format(new Date(patient.registrationDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm">Contacto de emergencia</span>
              </div>
              <p className="text-lg font-medium">{patient.emergencyContact}</p>
              <p className="text-sm text-gray-600">{patient.emergencyPhone}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Fecha de nacimiento</span>
              </div>
              <p className="text-lg">
                {format(new Date(patient.birthDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evolution Chart */}
      {historyData.length > 1 && (
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Evolución del IMC
            </CardTitle>
            <CardDescription>
              Progreso del Índice de Masa Corporal a lo largo del tiempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === 'bmi' ? `${value} kg/m²` : `${value} kg`,
                      name === 'bmi' ? 'IMC' : 'Peso'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="bmi"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      {patient.medicalHistory && patient.medicalHistory.length > 0 && (
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historial de Registros
            </CardTitle>
            <CardDescription>
              Todos los registros médicos del paciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patient.medicalHistory.map((record, index) => (
                <div key={record.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Registro #{index + 1}</h4>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(record.date), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Peso:</span>
                      <p className="font-medium">{record.weight} kg</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estatura:</span>
                      <p className="font-medium">{record.height} cm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IMC:</span>
                      <p className="font-medium">{record.bmi} kg/m²</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Percentil:</span>
                      <p className="font-medium">{record.percentile}%</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-muted-foreground text-sm">Doctor:</span>
                    <p className="text-sm font-medium">{record.doctorName}</p>
                  </div>
                  {record.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-muted-foreground text-sm">Notas:</span>
                      <p className="text-sm mt-1">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}