import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Patient, MedicalRecord } from '@/types/patient';
import { Alert as AlertType } from '@/types/nutrition';
import { validateRecord, hasHardErrors, getErrorMessages } from '@/utils/validation';
import { classifyNutritionalStatus, generateAlert, getStatusColor, getStatusIcon } from '@/utils/nutritionalClassification';
import { calculateBMI } from '@/utils/bmi';
import { addAlert, loadAlerts } from '@/utils/storage';
import { auditRecordCreation } from '@/utils/audit';
import { getCurrentUser } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { Calculator, User, AlertTriangle, CheckCircle, XCircle, Calendar, FileText } from 'lucide-react';

interface EnhancedBMICalculatorProps {
  patients: Patient[];
  onPatientUpdate: (patient: Patient) => void;
}

const EnhancedBMICalculator: React.FC<EnhancedBMICalculatorProps> = ({ patients, onPatientUpdate }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertType | null>(null);
  const { toast } = useToast();

  // RF-1: Cálculo automático de IMC
  const calculateAndClassify = () => {
    if (!selectedPatient) return;

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const age = selectedPatient.age;

    // RF-5: Validación de datos
    const validationResults = validateRecord({
      weight: weightNum,
      height: heightNum,
      age,
      gender: selectedPatient.gender,
      measurementDate
    });

    const errors = getErrorMessages(validationResults);
    setValidationErrors(errors);

    if (hasHardErrors(validationResults)) {
      toast({
        title: "Error de validación",
        description: "Hay errores que impiden guardar el registro. Revise los datos ingresados.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    // Calcular IMC
    const bmi = calculateBMI(weightNum, heightNum);
    
    // RF-3: Clasificación nutricional automática
    const classification = classifyNutritionalStatus(bmi, age, selectedPatient.gender);
    
    // RF-4: Generar alerta
    const alert = generateAlert(selectedPatient.id, crypto.randomUUID(), classification);
    setCurrentAlert(alert);

    // Crear registro médico
    const medicalRecord: MedicalRecord = {
      id: crypto.randomUUID(),
      patientId: selectedPatient.id,
      measurementDate,
      weight: weightNum,
      height: heightNum,
      bmi,
      nutritionalStatus: classification.status,
      alertLevel: classification.alertLevel,
      percentile: 50, // Simplificado por ahora
      notes,
      professionalId: getCurrentUser()?.id || '',
      professionalName: getCurrentUser()?.fullName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTrail: {
        createdBy: getCurrentUser()?.id || '',
        reason: 'Registro antropométrico'
      }
    };

    // Actualizar paciente
    const updatedPatient = {
      ...selectedPatient,
      medicalHistory: [...(selectedPatient.medicalHistory || []), medicalRecord]
    };

    onPatientUpdate(updatedPatient);

    // Guardar alerta
    addAlert(alert);

    // RF-6: Auditoría
    auditRecordCreation(medicalRecord, getCurrentUser()?.id || '', getCurrentUser()?.fullName || '');

    // Mostrar resultado
    toast({
      title: "Registro guardado",
      description: `IMC calculado: ${bmi.toFixed(2)} - ${classification.message}`,
      variant: classification.status === 'red' ? 'destructive' : 'default'
    });

    // Reset form
    setWeight('');
    setHeight('');
    setNotes('');
    setValidationErrors([]);
    setIsCalculating(false);
  };

  const getStatusBadge = (status: 'red' | 'yellow' | 'green') => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200'
    };

    const icons = {
      red: <XCircle className="h-4 w-4" />,
      yellow: <AlertTriangle className="h-4 w-4" />,
      green: <CheckCircle className="h-4 w-4" />
    };

    const labels = {
      red: 'Crítico',
      yellow: 'Riesgo',
      green: 'Normal'
    };

    return (
      <Badge className={`${colors[status]} flex items-center gap-1`}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Sistema de Evaluación Nutricional</h1>
              <p className="text-cyan-100">Registro antropométrico con clasificación automática y alertas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Registro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Registro Antropométrico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selección de Paciente */}
            <div>
              <Label htmlFor="patient">Paciente *</Label>
              <Select onValueChange={(value) => {
                const patient = patients.find(p => p.id === value);
                setSelectedPatient(patient || null);
                setCurrentAlert(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.fullName} - {patient.age} años - {patient.gender === 'male' ? 'M' : 'F'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPatient && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Información del Paciente</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Nombre:</strong> {selectedPatient.fullName}</p>
                    <p><strong>Edad:</strong> {selectedPatient.age} años</p>
                    <p><strong>Cédula:</strong> {selectedPatient.cedula}</p>
                    <p><strong>Género:</strong> {selectedPatient.gender === 'male' ? 'Masculino' : 'Femenino'}</p>
                  </div>
                </div>

                <Separator />

                {/* Datos Antropométricos */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Peso (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Ej: 25.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Talla (m) *</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Ej: 1.25"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Fecha de Medición *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={measurementDate}
                    onChange={(e) => setMeasurementDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                {/* Errores de Validación */}
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={calculateAndClassify}
                  disabled={!weight || !height || isCalculating}
                  className="w-full"
                >
                  {isCalculating ? 'Calculando...' : 'Calcular IMC y Clasificar'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Resultados y Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resultados y Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentAlert ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Estado Nutricional</h3>
                  {getStatusBadge(currentAlert.status)}
                </div>
                
                <Alert className={`border-l-4 ${
                  currentAlert.status === 'red' ? 'border-red-500 bg-red-50' :
                  currentAlert.status === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">{currentAlert.title}</p>
                      <p>{currentAlert.message}</p>
                      <p className="text-sm text-gray-600">{currentAlert.recommendation}</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="text-sm text-gray-600">
                  <p><strong>Generado:</strong> {new Date(currentAlert.createdAt).toLocaleString()}</p>
                  <p><strong>Nivel de Alerta:</strong> {currentAlert.level}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona un paciente y registra los datos antropométricos para ver los resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedBMICalculator;
