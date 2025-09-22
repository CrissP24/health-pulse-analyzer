import { ValidationRange, NutritionalThreshold } from '@/types/nutrition';

// RF-5: Validación de datos de entrada
export interface ValidationResult {
  isValid: boolean;
  isHardError: boolean;
  field: string;
  message: string;
  code: string;
}

export interface ValidationRules {
  weight: {
    min: number;
    max: number;
    decimals: number;
  };
  height: {
    min: number;
    max: number;
    decimals: number;
  };
  age: {
    min: number;
    max: number;
  };
}

// V-1: Validación de peso
export function validateWeight(weight: number, age: number, gender: 'male' | 'female'): ValidationResult {
  // Obtener rangos del catálogo (por ahora hardcodeados, después serán parametrizables)
  const ranges = getValidationRanges(age, gender);
  
  if (isNaN(weight) || weight <= 0) {
    return {
      isValid: false,
      isHardError: true,
      field: 'weight',
      message: 'El peso debe ser un número válido mayor a 0',
      code: 'WEIGHT_INVALID'
    };
  }

  if (weight < ranges.minWeight) {
    return {
      isValid: false,
      isHardError: true,
      field: 'weight',
      message: `El peso no puede ser menor a ${ranges.minWeight} kg para la edad seleccionada`,
      code: 'WEIGHT_TOO_LOW'
    };
  }

  if (weight > ranges.maxWeight) {
    return {
      isValid: false,
      isHardError: true,
      field: 'weight',
      message: 'Valor ingresado en exceso para la edad seleccionada. Verifique el dato.',
      code: 'WEIGHT_TOO_HIGH'
    };
  }

  // Validar decimales
  const decimalPlaces = (weight.toString().split('.')[1] || '').length;
  if (decimalPlaces > 1) {
    return {
      isValid: false,
      isHardError: false,
      field: 'weight',
      message: 'Ingrese un número válido con hasta 1 decimal',
      code: 'WEIGHT_DECIMALS'
    };
  }

  return { isValid: true, isHardError: false, field: 'weight', message: '', code: '' };
}

// V-2: Validación de talla
export function validateHeight(height: number, age: number, gender: 'male' | 'female'): ValidationResult {
  const ranges = getValidationRanges(age, gender);
  
  if (isNaN(height) || height <= 0) {
    return {
      isValid: false,
      isHardError: true,
      field: 'height',
      message: 'La talla debe ser un número válido mayor a 0',
      code: 'HEIGHT_INVALID'
    };
  }

  if (height < ranges.minHeight) {
    return {
      isValid: false,
      isHardError: true,
      field: 'height',
      message: `La talla no puede ser menor a ${ranges.minHeight} m para la edad seleccionada`,
      code: 'HEIGHT_TOO_LOW'
    };
  }

  if (height > ranges.maxHeight) {
    return {
      isValid: false,
      isHardError: true,
      field: 'height',
      message: 'Valor ingresado en exceso para la edad seleccionada. Verifique el dato.',
      code: 'HEIGHT_TOO_HIGH'
    };
  }

  // Validar decimales (2 decimales para talla)
  const decimalPlaces = (height.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return {
      isValid: false,
      isHardError: false,
      field: 'height',
      message: 'Ingrese un número válido con hasta 2 decimales',
      code: 'HEIGHT_DECIMALS'
    };
  }

  return { isValid: true, isHardError: false, field: 'height', message: '', code: '' };
}

// V-3: Validación de consistencia IMC
export function validateBMIConsistency(bmi: number, age: number): ValidationResult {
  // IMC fisiológico absoluto (parámetro global)
  const absoluteMinBMI = 8.0;
  const absoluteMaxBMI = 50.0;

  if (bmi < absoluteMinBMI) {
    return {
      isValid: false,
      isHardError: true,
      field: 'bmi',
      message: 'IMC fuera de rango fisiológico. Revise los datos ingresados.',
      code: 'BMI_TOO_LOW'
    };
  }

  if (bmi > absoluteMaxBMI) {
    return {
      isValid: false,
      isHardError: true,
      field: 'bmi',
      message: 'IMC fuera de rango fisiológico. Revise los datos ingresados.',
      code: 'BMI_TOO_HIGH'
    };
  }

  return { isValid: true, isHardError: false, field: 'bmi', message: '', code: '' };
}

// V-4: Validación de fechas
export function validateMeasurementDate(date: string): ValidationResult {
  const measurementDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Fin del día actual

  if (measurementDate > today) {
    return {
      isValid: false,
      isHardError: true,
      field: 'measurementDate',
      message: 'La fecha de medición no puede ser futura',
      code: 'DATE_FUTURE'
    };
  }

  // No permitir fechas muy antiguas (más de 10 años)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

  if (measurementDate < tenYearsAgo) {
    return {
      isValid: false,
      isHardError: true,
      field: 'measurementDate',
      message: 'La fecha de medición no puede ser anterior a 10 años',
      code: 'DATE_TOO_OLD'
    };
  }

  return { isValid: true, isHardError: false, field: 'measurementDate', message: '', code: '' };
}

// Función auxiliar para obtener rangos de validación
function getValidationRanges(age: number, gender: 'male' | 'female'): ValidationRules {
  // Por ahora hardcodeado, después será desde catálogo
  if (age >= 3 && age <= 5) {
    return {
      weight: { min: 10, max: 30, decimals: 1 },
      height: { min: 0.8, max: 1.3, decimals: 2 },
      age: { min: 3, max: 5 }
    };
  } else if (age >= 6 && age <= 10) {
    return {
      weight: { min: 15, max: 50, decimals: 1 },
      height: { min: 1.0, max: 1.5, decimals: 2 },
      age: { min: 6, max: 10 }
    };
  } else if (age >= 11 && age <= 17) {
    return {
      weight: { min: 25, max: 80, decimals: 1 },
      height: { min: 1.2, max: 1.8, decimals: 2 },
      age: { min: 11, max: 17 }
    };
  } else {
    return {
      weight: { min: 30, max: 150, decimals: 1 },
      height: { min: 1.3, max: 2.2, decimals: 2 },
      age: { min: 18, max: 100 }
    };
  }
}

// Validación completa de un registro
export function validateRecord(data: {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  measurementDate: string;
}): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Validar peso
  results.push(validateWeight(data.weight, data.age, data.gender));
  
  // Validar talla
  results.push(validateHeight(data.height, data.age, data.gender));
  
  // Validar fecha
  results.push(validateMeasurementDate(data.measurementDate));
  
  // Calcular IMC y validar consistencia
  const bmi = data.weight / (data.height * data.height);
  results.push(validateBMIConsistency(bmi, data.age));

  return results;
}

// Verificar si hay errores duros que bloqueen el guardado
export function hasHardErrors(validationResults: ValidationResult[]): boolean {
  return validationResults.some(result => result.isHardError);
}

// Obtener mensajes de error para mostrar al usuario
export function getErrorMessages(validationResults: ValidationResult[]): string[] {
  return validationResults
    .filter(result => !result.isValid)
    .map(result => result.message);
}
