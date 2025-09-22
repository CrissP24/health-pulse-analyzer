import { NutritionalThreshold, ValidationRange, Recommendation } from '@/types/nutrition';

// RF-7: Gestión de catálogos
const THRESHOLDS_STORAGE_KEY = 'nutritional_thresholds';
const RANGES_STORAGE_KEY = 'validation_ranges';
const RECOMMENDATIONS_STORAGE_KEY = 'recommendations';

// Gestión de umbrales nutricionales
export function saveThresholds(thresholds: NutritionalThreshold[]): void {
  try {
    localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(thresholds));
  } catch (error) {
    console.error('Error saving thresholds:', error);
  }
}

export function loadThresholds(): NutritionalThreshold[] {
  try {
    const data = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultThresholds();
  } catch (error) {
    console.error('Error loading thresholds:', error);
    return getDefaultThresholds();
  }
}

export function addThreshold(threshold: Omit<NutritionalThreshold, 'id' | 'createdAt' | 'updatedAt'>): void {
  const thresholds = loadThresholds();
  const newThreshold: NutritionalThreshold = {
    ...threshold,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  thresholds.push(newThreshold);
  saveThresholds(thresholds);
}

export function updateThreshold(id: string, updates: Partial<NutritionalThreshold>): void {
  const thresholds = loadThresholds();
  const index = thresholds.findIndex(t => t.id === id);
  if (index !== -1) {
    thresholds[index] = {
      ...thresholds[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveThresholds(thresholds);
  }
}

// Gestión de rangos de validación
export function saveRanges(ranges: ValidationRange[]): void {
  try {
    localStorage.setItem(RANGES_STORAGE_KEY, JSON.stringify(ranges));
  } catch (error) {
    console.error('Error saving ranges:', error);
  }
}

export function loadRanges(): ValidationRange[] {
  try {
    const data = localStorage.getItem(RANGES_STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultRanges();
  } catch (error) {
    console.error('Error loading ranges:', error);
    return getDefaultRanges();
  }
}

export function addRange(range: Omit<ValidationRange, 'id' | 'createdAt' | 'updatedAt'>): void {
  const ranges = loadRanges();
  const newRange: ValidationRange = {
    ...range,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  ranges.push(newRange);
  saveRanges(ranges);
}

export function updateRange(id: string, updates: Partial<ValidationRange>): void {
  const ranges = loadRanges();
  const index = ranges.findIndex(r => r.id === id);
  if (index !== -1) {
    ranges[index] = {
      ...ranges[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveRanges(ranges);
  }
}

// Gestión de recomendaciones
export function saveRecommendations(recommendations: Recommendation[]): void {
  try {
    localStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify(recommendations));
  } catch (error) {
    console.error('Error saving recommendations:', error);
  }
}

export function loadRecommendations(): Recommendation[] {
  try {
    const data = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultRecommendations();
  } catch (error) {
    console.error('Error loading recommendations:', error);
    return getDefaultRecommendations();
  }
}

export function addRecommendation(recommendation: Omit<Recommendation, 'id'>): void {
  const recommendations = loadRecommendations();
  const newRecommendation: Recommendation = {
    ...recommendation,
    id: crypto.randomUUID()
  };
  recommendations.push(newRecommendation);
  saveRecommendations(recommendations);
}

// Obtener umbral por edad y sexo
export function getThresholdByAgeAndGender(age: number, gender: 'male' | 'female'): NutritionalThreshold | null {
  const thresholds = loadThresholds();
  const ageGroup = getAgeGroup(age);
  
  return thresholds.find(t => 
    t.ageGroup === ageGroup && 
    t.gender === gender && 
    t.isActive
  ) || null;
}

// Obtener rango por edad y sexo
export function getRangeByAgeAndGender(age: number, gender: 'male' | 'female'): ValidationRange | null {
  const ranges = loadRanges();
  const ageGroup = getAgeGroup(age);
  
  return ranges.find(r => 
    r.ageGroup === ageGroup && 
    r.gender === gender && 
    r.isActive
  ) || null;
}

// Obtener recomendación por estado
export function getRecommendationByStatus(status: 'red' | 'yellow' | 'green'): Recommendation | null {
  const recommendations = loadRecommendations();
  return recommendations.find(r => 
    r.status === status && 
    r.isActive
  ) || null;
}

// Función auxiliar para determinar grupo etario
function getAgeGroup(age: number): string {
  if (age >= 3 && age <= 5) return '3-5';
  if (age >= 6 && age <= 10) return '6-10';
  if (age >= 11 && age <= 17) return '11-17';
  return '18+';
}

// Umbrales por defecto
function getDefaultThresholds(): NutritionalThreshold[] {
  return [
    {
      id: '1',
      ageGroup: '3-5',
      gender: 'male',
      redMax: 13.0,
      yellowMax: 14.0,
      greenMax: 17.0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      ageGroup: '3-5',
      gender: 'female',
      redMax: 12.8,
      yellowMax: 13.8,
      greenMax: 16.8,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      ageGroup: '6-10',
      gender: 'male',
      redMax: 13.5,
      yellowMax: 14.5,
      greenMax: 18.0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      ageGroup: '6-10',
      gender: 'female',
      redMax: 13.2,
      yellowMax: 14.2,
      greenMax: 17.8,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// Rangos por defecto
function getDefaultRanges(): ValidationRange[] {
  return [
    {
      id: '1',
      ageGroup: '3-5',
      gender: 'male',
      minWeight: 10,
      maxWeight: 30,
      minHeight: 0.8,
      maxHeight: 1.3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      ageGroup: '3-5',
      gender: 'female',
      minWeight: 9,
      maxWeight: 28,
      minHeight: 0.75,
      maxHeight: 1.25,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      ageGroup: '6-10',
      gender: 'male',
      minWeight: 15,
      maxWeight: 50,
      minHeight: 1.0,
      maxHeight: 1.5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      ageGroup: '6-10',
      gender: 'female',
      minWeight: 14,
      maxWeight: 45,
      minHeight: 0.95,
      maxHeight: 1.45,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// Recomendaciones por defecto
function getDefaultRecommendations(): Recommendation[] {
  return [
    {
      id: '1',
      status: 'red',
      title: 'Alerta Crítica',
      message: 'Estado nutricional GRAVE. Requiere atención inmediata.',
      action: 'Derivar inmediatamente a especialista en nutrición pediátrica.',
      priority: 1,
      isActive: true
    },
    {
      id: '2',
      status: 'yellow',
      title: 'Alerta de Seguimiento',
      message: 'Principios de desnutrición. Programar control y seguimiento.',
      action: 'Programar cita de control en 2-4 semanas.',
      priority: 2,
      isActive: true
    },
    {
      id: '3',
      status: 'green',
      title: 'Estado Normal',
      message: 'Peso normal. Mantener alimentación adecuada y controles.',
      action: 'Mantener alimentación balanceada y controles periódicos.',
      priority: 3,
      isActive: true
    }
  ];
}
