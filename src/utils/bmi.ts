import { BMICategory, BMI_CATEGORIES, ChildBMICategory, ChildBMITable } from '@/types/patient';

// Tabla de percentiles para niños de 3-10 años
export const CHILD_BMI_TABLE: ChildBMITable[] = [
  { age: 3, bajoPeso: 14.0, riesgoDesnutricion: { min: 14.0, max: 14.6 }, pesoSaludable: { min: 14.7, max: 17.0 }, sobrepeso: 17.0 },
  { age: 4, bajoPeso: 13.8, riesgoDesnutricion: { min: 13.8, max: 14.4 }, pesoSaludable: { min: 14.5, max: 17.1 }, sobrepeso: 17.1 },
  { age: 5, bajoPeso: 13.6, riesgoDesnutricion: { min: 13.6, max: 14.3 }, pesoSaludable: { min: 14.4, max: 17.4 }, sobrepeso: 17.4 },
  { age: 6, bajoPeso: 13.5, riesgoDesnutricion: { min: 13.5, max: 14.3 }, pesoSaludable: { min: 14.4, max: 17.8 }, sobrepeso: 17.8 },
  { age: 7, bajoPeso: 13.5, riesgoDesnutricion: { min: 13.5, max: 14.2 }, pesoSaludable: { min: 14.3, max: 18.3 }, sobrepeso: 18.3 },
  { age: 8, bajoPeso: 13.6, riesgoDesnutricion: { min: 13.6, max: 14.3 }, pesoSaludable: { min: 14.4, max: 18.9 }, sobrepeso: 18.9 },
  { age: 9, bajoPeso: 13.8, riesgoDesnutricion: { min: 13.8, max: 14.5 }, pesoSaludable: { min: 14.6, max: 19.4 }, sobrepeso: 19.4 },
  { age: 10, bajoPeso: 14.0, riesgoDesnutricion: { min: 14.0, max: 14.7 }, pesoSaludable: { min: 14.8, max: 20.0 }, sobrepeso: 20.0 }
];

export const CHILD_BMI_CATEGORIES = {
  bajo_peso: { label: 'Bajo peso (IMC < p5)', color: '#3b82f6' },
  riesgo_desnutricion: { label: 'Riesgo de desnutrición (IMC ~ p5-p15)', color: '#f59e0b' },
  peso_saludable: { label: 'Peso saludable (IMC ~ p15-p85)', color: '#10b981' },
  sobrepeso: { label: 'Sobrepeso (IMC > p85)', color: '#ef4444' }
};

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

export function getBMICategory(bmi: number): BMICategory {
  if (bmi < BMI_CATEGORIES.normal.min) return 'underweight';
  if (bmi < BMI_CATEGORIES.overweight.min) return 'normal';
  if (bmi < BMI_CATEGORIES.obesity.min) return 'overweight';
  return 'obesity';
}

export function getChildBMICategory(bmi: number, age: number): ChildBMICategory {
  const ageData = CHILD_BMI_TABLE.find(data => data.age === age);
  if (!ageData) return 'peso_saludable';

  if (bmi < ageData.riesgoDesnutricion.min) return 'bajo_peso';
  if (bmi <= ageData.riesgoDesnutricion.max) return 'riesgo_desnutricion';
  if (bmi <= ageData.pesoSaludable.max) return 'peso_saludable';
  return 'sobrepeso';
}

export function getChildBMIPercentile(bmi: number, age: number): number {
  const ageData = CHILD_BMI_TABLE.find(data => data.age === age);
  if (!ageData) return 50;

  if (bmi < ageData.riesgoDesnutricion.min) return 5;
  if (bmi <= ageData.riesgoDesnutricion.max) return 10;
  if (bmi <= ageData.pesoSaludable.max) return 50;
  return 90;
}

export function getBMICategoryInfo(category: BMICategory) {
  return BMI_CATEGORIES[category];
}

export function getChildBMICategoryInfo(category: ChildBMICategory) {
  return CHILD_BMI_CATEGORIES[category];
}

export function formatBMI(bmi: number): string {
  return `${bmi} kg/m²`;
}