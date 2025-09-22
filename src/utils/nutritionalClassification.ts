import { NutritionalStatus, AlertLevel, NutritionalThreshold } from '@/types/nutrition';

// RF-3: Clasificación nutricional automática
export interface ClassificationResult {
  status: NutritionalStatus;
  alertLevel: AlertLevel;
  message: string;
  recommendation: string;
  priority: number;
}

// RN-1: Cálculo y clasificación obligatoria
export function classifyNutritionalStatus(
  bmi: number, 
  age: number, 
  gender: 'male' | 'female'
): ClassificationResult {
  // Obtener umbrales del catálogo (por ahora hardcodeados)
  const thresholds = getNutritionalThresholds(age, gender);
  
  let status: NutritionalStatus;
  let alertLevel: AlertLevel;
  let message: string;
  let recommendation: string;
  let priority: number;

  if (bmi < thresholds.redMax) {
    status = 'red';
    alertLevel = 'critical';
    message = 'Estado nutricional GRAVE. Requiere atención inmediata.';
    recommendation = 'Derivar inmediatamente a especialista en nutrición pediátrica. Evaluar hospitalización si es necesario.';
    priority = 1;
  } else if (bmi < thresholds.yellowMax) {
    status = 'yellow';
    alertLevel = 'warning';
    message = 'Principios de desnutrición. Programar control y seguimiento.';
    recommendation = 'Programar cita de control en 2-4 semanas. Evaluar alimentación y estilo de vida.';
    priority = 2;
  } else if (bmi <= thresholds.greenMax) {
    status = 'green';
    alertLevel = 'info';
    message = 'Peso normal. Mantener alimentación adecuada y controles.';
    recommendation = 'Mantener alimentación balanceada y controles periódicos cada 6 meses.';
    priority = 3;
  } else {
    status = 'red';
    alertLevel = 'critical';
    message = 'Sobrepeso/Obesidad grave. Requiere atención inmediata.';
    recommendation = 'Derivar a especialista en nutrición. Implementar plan de alimentación y ejercicio.';
    priority = 1;
  }

  return {
    status,
    alertLevel,
    message,
    recommendation,
    priority
  };
}

// Obtener umbrales por edad y sexo (por ahora hardcodeados, después desde catálogo)
function getNutritionalThresholds(age: number, gender: 'male' | 'female'): {
  redMax: number;
  yellowMax: number;
  greenMax: number;
} {
  // Basado en estándares de la OMS para niños
  if (age >= 3 && age <= 5) {
    return {
      redMax: 13.0,    // Desnutrición grave
      yellowMax: 14.0, // Riesgo de desnutrición
      greenMax: 17.0   // Peso normal
    };
  } else if (age >= 6 && age <= 10) {
    return {
      redMax: 13.5,
      yellowMax: 14.5,
      greenMax: 18.0
    };
  } else if (age >= 11 && age <= 17) {
    return {
      redMax: 15.0,
      yellowMax: 16.0,
      greenMax: 25.0
    };
  } else {
    // Adultos (18+)
    return {
      redMax: 18.5,
      yellowMax: 25.0,
      greenMax: 30.0
    };
  }
}

// Calcular percentil basado en edad y sexo
export function calculatePercentile(bmi: number, age: number, gender: 'male' | 'female'): number {
  // Por ahora simplificado, después se implementará con tablas de referencia
  const thresholds = getNutritionalThresholds(age, gender);
  
  if (bmi < thresholds.redMax) {
    return 5; // P3
  } else if (bmi < thresholds.yellowMax) {
    return 10; // P15
  } else if (bmi <= thresholds.greenMax) {
    return 50; // P50
  } else {
    return 95; // P97
  }
}

// Generar alerta basada en clasificación
export function generateAlert(
  patientId: string,
  recordId: string,
  classification: ClassificationResult
): {
  id: string;
  patientId: string;
  recordId: string;
  level: AlertLevel;
  status: NutritionalStatus;
  title: string;
  message: string;
  recommendation: string;
  isResolved: boolean;
  createdAt: string;
} {
  const alertId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  let title: string;
  switch (classification.status) {
    case 'red':
      title = 'Alerta Crítica - Estado Nutricional Grave';
      break;
    case 'yellow':
      title = 'Alerta de Seguimiento - Riesgo Nutricional';
      break;
    case 'green':
      title = 'Estado Nutricional Normal';
      break;
  }

  return {
    id: alertId,
    patientId,
    recordId,
    level: classification.alertLevel,
    status: classification.status,
    title,
    message: classification.message,
    recommendation: classification.recommendation,
    isResolved: classification.status === 'green',
    createdAt: now
  };
}

// RN-4: Priorización de alertas
export function prioritizeAlerts(alerts: any[]): any[] {
  return alerts.sort((a, b) => {
    // Primero por prioridad (1 = más alta)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Luego por fecha de creación (más recientes primero)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Obtener color para estado nutricional
export function getStatusColor(status: NutritionalStatus): string {
  switch (status) {
    case 'red':
      return '#ef4444'; // Rojo
    case 'yellow':
      return '#f59e0b'; // Amarillo
    case 'green':
      return '#10b981'; // Verde
    default:
      return '#6b7280'; // Gris
  }
}

// Obtener icono para estado nutricional
export function getStatusIcon(status: NutritionalStatus): string {
  switch (status) {
    case 'red':
      return '🚨'; // Alerta crítica
    case 'yellow':
      return '⚠️'; // Advertencia
    case 'green':
      return '✅'; // Normal
    default:
      return '❓'; // Desconocido
  }
}
