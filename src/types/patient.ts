export interface Patient {
  id: string;
  fullName: string;
  cedula: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  registrationDate: string;
  medicalHistory?: MedicalRecord[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  measurementDate: string;
  weight: number;
  height: number;
  bmi: number;
  nutritionalStatus: 'red' | 'yellow' | 'green';
  alertLevel: 'critical' | 'warning' | 'info';
  percentile: number;
  notes?: string;
  professionalId: string;
  professionalName: string;
  createdAt: string;
  updatedAt: string;
  // RF-6: Auditoría
  auditTrail: {
    createdBy: string;
    updatedBy?: string;
    reason?: string;
  };
}

export interface BMICalculation {
  id: string;
  patientId: string;
  date: string;
  weight: number;
  height: number;
  age: number;
  bmi: number;
  category: ChildBMICategory;
  percentile: number;
  doctorId: string;
  doctorName: string;
  notes?: string;
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obesity';
export type ChildBMICategory = 'bajo_peso' | 'riesgo_desnutricion' | 'peso_saludable' | 'sobrepeso';

export interface ChildBMITable {
  age: number;
  bajoPeso: number;
  riesgoDesnutricion: { min: number; max: number };
  pesoSaludable: { min: number; max: number };
  sobrepeso: number;
}

export interface PatientFilters {
  gender?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  bmiCategory?: BMICategory;
}

export interface BMIDistribution {
  category: BMICategory;
  count: number;
  percentage: number;
}

export interface GenderBMIAverage {
  gender: string;
  averageBMI: number;
  count: number;
}

export const BMI_CATEGORIES = {
  underweight: { min: 0, max: 18.5, label: 'Bajo peso', color: '#3b82f6' },
  normal: { min: 18.5, max: 25, label: 'Normal', color: '#10b981' },
  overweight: { min: 25, max: 30, label: 'Sobrepeso', color: '#f59e0b' },
  obesity: { min: 30, max: 100, label: 'Obesidad', color: '#ef4444' }
};