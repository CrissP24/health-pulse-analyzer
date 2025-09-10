import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patient, BMICalculation, MedicalRecord } from '@/types/patient';
import { calculateBMI, getChildBMICategory, getChildBMIPercentile, getChildBMICategoryInfo, CHILD_BMI_TABLE } from '@/utils/bmi';
import { getCurrentUser } from '@/utils/auth';
import { Calculator, User, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MedicalHistory from './MedicalHistory';
import GrowthChart from './GrowthChart';
import PatientDebug from './PatientDebug';

interface BMICalculatorProps {
  patients: Patient[];
  onPatientUpdate: (patient: Patient) => void;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ patients, onPatientUpdate }) => {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [bmiResult, setBmiResult] = useState<BMICalculation | null>(null);

  const calculateBMIForChild = () => {
    if (!selectedPatient || !weight || !height) return;

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const age = selectedPatient.age;

    if (age < 3 || age > 10) {
      toast({
        title: "Error",
        description: "El cálculo de IMC solo está disponible para niños de 3 a 10 años",
        variant: "destructive"
      });
      return;
    }

    const bmi = calculateBMI(weightNum, heightNum);
    const category = getChildBMICategory(bmi, age);
    const percentile = getChildBMIPercentile(bmi, age);

    const calculation: BMICalculation = {
      id: crypto.randomUUID(),
      patientId: selectedPatient.id,
      date: new Date().toISOString(),
      weight: weightNum,
      height: heightNum,
      age,
      bmi,
      category,
      percentile,
      doctorId: user?.id || '',
      doctorName: user?.fullName || '',
      notes
    };

    setBmiResult(calculation);
  };

  const saveCalculation = () => {
    if (!bmiResult || !selectedPatient) return;

    const medicalRecord: MedicalRecord = {
      id: crypto.randomUUID(),
      date: bmiResult.date,
      weight: bmiResult.weight,
      height: bmiResult.height,
      bmi: bmiResult.bmi,
      bmiCategory: bmiResult.category,
      percentile: bmiResult.percentile,
      notes: bmiResult.notes,
      doctorId: bmiResult.doctorId,
      doctorName: bmiResult.doctorName
    };

    const updatedPatient = {
      ...selectedPatient,
      medicalHistory: [...(selectedPatient.medicalHistory || []), medicalRecord]
    };

    onPatientUpdate(updatedPatient);
    
    toast({
      title: "Cálculo guardado",
      description: `IMC de ${selectedPatient.fullName} guardado exitosamente`,
    });

    // Reset form
    setWeight('');
    setHeight('');
    setNotes('');
    setBmiResult(null);
  };

  const getCategoryColor = (category: string) => {
    const categoryInfo = getChildBMICategoryInfo(category as any);
    return categoryInfo?.color || '#6b7280';
  };

  const getCategoryLabel = (category: string) => {
    const categoryInfo = getChildBMICategoryInfo(category as any);
    return categoryInfo?.label || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Cálculo de IMC para Niños</h1>
              <p className="text-cyan-100">Sistema especializado para niños de 3 a 10 años con percentiles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Component - Remove in production */}
      <PatientDebug patients={patients} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seleccionar Paciente y Calcular IMC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patient">Paciente</Label>
              <Select onValueChange={(value) => {
                const patient = patients.find(p => p.id === value);
                setSelectedPatient(patient || null);
                setBmiResult(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.filter(p => p.age >= 3 && p.age <= 10).map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.fullName} - {patient.age} años
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {patients.length} pacientes totales, {patients.filter(p => p.age >= 3 && p.age <= 10).length} elegibles para IMC
              </p>
            </div>

            {selectedPatient && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Información del Paciente</h3>
                  <p><strong>Nombre:</strong> {selectedPatient.fullName}</p>
                  <p><strong>Edad:</strong> {selectedPatient.age} años</p>
                  <p><strong>Cédula:</strong> {selectedPatient.cedula}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="25.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Estatura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="120"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas médicas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones del médico..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={calculateBMIForChild}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  disabled={!weight || !height}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular IMC
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultados del Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bmiResult ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-cyan-600 mb-2">
                    {bmiResult.bmi} kg/m²
                  </div>
                  <Badge 
                    style={{ backgroundColor: getCategoryColor(bmiResult.category) }}
                    className="text-white"
                  >
                    {getCategoryLabel(bmiResult.category)}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Percentil: {bmiResult.percentile}%
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Peso:</span>
                    <span className="font-medium">{bmiResult.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estatura:</span>
                    <span className="font-medium">{bmiResult.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Edad:</span>
                    <span className="font-medium">{bmiResult.age} años</span>
                  </div>
                </div>

                {bmiResult.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notas:</Label>
                    <p className="text-sm text-gray-600 mt-1">{bmiResult.notes}</p>
                  </div>
                )}

                <Button 
                  onClick={saveCalculation}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Guardar en Historial
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Selecciona un paciente y calcula su IMC para ver los resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medical History */}
      {selectedPatient && (
        <MedicalHistory patient={selectedPatient} />
      )}

      {/* Growth Chart */}
      {selectedPatient && selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
        <GrowthChart patient={selectedPatient} />
      )}

      {/* BMI Table Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tabla de Referencia de IMC para Niños (3-10 años)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Edad (años)</TableHead>
                  <TableHead>Bajo peso (IMC &lt; p5)</TableHead>
                  <TableHead>Riesgo de desnutrición (IMC ~ p5-p15)</TableHead>
                  <TableHead>Peso saludable (IMC ~ p15-p85)</TableHead>
                  <TableHead>Sobrepeso (IMC &gt; p85)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CHILD_BMI_TABLE.map((row) => (
                  <TableRow key={row.age}>
                    <TableCell className="font-medium">{row.age}</TableCell>
                    <TableCell>&lt; {row.bajoPeso}</TableCell>
                    <TableCell>{row.riesgoDesnutricion.min} - {row.riesgoDesnutricion.max}</TableCell>
                    <TableCell>{row.pesoSaludable.min} - {row.pesoSaludable.max}</TableCell>
                    <TableCell>&gt; {row.sobrepeso}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BMICalculator;
