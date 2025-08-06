export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  bmi: number;
  bmiCategory: BMICategory;
  registrationDate: string;
  history?: PatientRecord[];
}

export interface PatientRecord {
  id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bmiCategory: BMICategory;
  notes?: string;
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obesity';

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