// RF-3: Clasificación nutricional automática
export type NutritionalStatus = 'red' | 'yellow' | 'green';
export type AlertLevel = 'critical' | 'warning' | 'info';

// RF-7: Gestión de catálogos
export interface NutritionalThreshold {
  id: string;
  ageGroup: string;
  gender: 'male' | 'female';
  redMax: number;
  yellowMax: number;
  greenMax: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationRange {
  id: string;
  ageGroup: string;
  gender: 'male' | 'female';
  minWeight: number;
  maxWeight: number;
  minHeight: number;
  maxHeight: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  status: NutritionalStatus;
  title: string;
  message: string;
  action: string;
  priority: number;
  isActive: boolean;
}

// RF-4: Alertas y recomendaciones
export interface Alert {
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
  resolvedAt?: string;
  resolvedBy?: string;
}

// RF-8: Seguimiento clínico
export interface FollowUp {
  id: string;
  alertId: string;
  patientId: string;
  scheduledDate: string;
  professionalId: string;
  professionalName: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
}

// RF-6: Bitácora / auditoría
export interface AuditLog {
  id: string;
  entity: 'patient' | 'record' | 'alert' | 'followup';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'resolve';
  before: any;
  after: any;
  userId: string;
  userName: string;
  reason?: string;
  timestamp: string;
}

// RF-10: Roles y permisos
export type UserRole = 'admin' | 'health_professional' | 'consultant';

export interface Permission {
  id: string;
  role: UserRole;
  resource: string;
  actions: string[];
}

// RF-2: Estadísticas
export interface NutritionalStats {
  totalPatients: number;
  redAlerts: number;
  yellowAlerts: number;
  greenStatus: number;
  monthlyEvolution: MonthlyEvolution[];
  ageGroupDistribution: AgeGroupStats[];
  genderDistribution: GenderStats[];
}

export interface MonthlyEvolution {
  month: string;
  red: number;
  yellow: number;
  green: number;
}

export interface AgeGroupStats {
  ageGroup: string;
  count: number;
  redPercentage: number;
  yellowPercentage: number;
  greenPercentage: number;
}

export interface GenderStats {
  gender: string;
  count: number;
  redPercentage: number;
  yellowPercentage: number;
  greenPercentage: number;
}

// RF-9: Reportes
export interface ReportData {
  id: string;
  type: 'nutritional_status' | 'alerts' | 'followup' | 'evolution';
  title: string;
  description: string;
  filters: ReportFilters;
  data: any[];
  generatedAt: string;
  generatedBy: string;
}

export interface ReportFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  gender?: string;
  ageGroups?: string[];
  status?: NutritionalStatus[];
  professionalId?: string;
}
