import { BMICategory, BMI_CATEGORIES } from '@/types/patient';

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

export function getBMICategoryInfo(category: BMICategory) {
  return BMI_CATEGORIES[category];
}

export function formatBMI(bmi: number): string {
  return `${bmi} kg/m²`;
}