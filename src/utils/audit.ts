import { AuditLog } from '@/types/nutrition';

// RF-6: Bitácora / auditoría
const AUDIT_STORAGE_KEY = 'audit_logs';

export function saveAuditLog(log: AuditLog): void {
  try {
    const logs = loadAuditLogs();
    logs.push(log);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving audit log:', error);
  }
}

export function loadAuditLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(AUDIT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading audit logs:', error);
    return [];
  }
}

export function createAuditLog(
  entity: 'patient' | 'record' | 'alert' | 'followup',
  entityId: string,
  action: 'create' | 'update' | 'delete' | 'resolve',
  before: any,
  after: any,
  userId: string,
  userName: string,
  reason?: string
): AuditLog {
  return {
    id: crypto.randomUUID(),
    entity,
    entityId,
    action,
    before,
    after,
    userId,
    userName,
    reason,
    timestamp: new Date().toISOString()
  };
}

// Registrar creación de paciente
export function auditPatientCreation(
  patient: any,
  userId: string,
  userName: string
): void {
  const auditLog = createAuditLog(
    'patient',
    patient.id,
    'create',
    null,
    patient,
    userId,
    userName,
    'Nuevo paciente registrado'
  );
  saveAuditLog(auditLog);
}

// Registrar actualización de paciente
export function auditPatientUpdate(
  patientId: string,
  before: any,
  after: any,
  userId: string,
  userName: string,
  reason?: string
): void {
  const auditLog = createAuditLog(
    'patient',
    patientId,
    'update',
    before,
    after,
    userId,
    userName,
    reason
  );
  saveAuditLog(auditLog);
}

// Registrar creación de registro médico
export function auditRecordCreation(
  record: any,
  userId: string,
  userName: string
): void {
  const auditLog = createAuditLog(
    'record',
    record.id,
    'create',
    null,
    record,
    userId,
    userName,
    'Nuevo registro antropométrico'
  );
  saveAuditLog(auditLog);
}

// Registrar resolución de alerta
export function auditAlertResolution(
  alertId: string,
  before: any,
  after: any,
  userId: string,
  userName: string,
  reason?: string
): void {
  const auditLog = createAuditLog(
    'alert',
    alertId,
    'resolve',
    before,
    after,
    userId,
    userName,
    reason
  );
  saveAuditLog(auditLog);
}

// Obtener historial de auditoría por entidad
export function getAuditHistory(entityId: string, entityType?: string): AuditLog[] {
  const logs = loadAuditLogs();
  return logs.filter(log => 
    log.entityId === entityId && 
    (!entityType || log.entity === entityType)
  );
}

// Obtener logs por usuario
export function getAuditLogsByUser(userId: string): AuditLog[] {
  const logs = loadAuditLogs();
  return logs.filter(log => log.userId === userId);
}

// Obtener logs por rango de fechas
export function getAuditLogsByDateRange(startDate: string, endDate: string): AuditLog[] {
  const logs = loadAuditLogs();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= start && logDate <= end;
  });
}

// Limpiar logs antiguos (más de 1 año)
export function cleanOldAuditLogs(): void {
  const logs = loadAuditLogs();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const recentLogs = logs.filter(log => 
    new Date(log.timestamp) > oneYearAgo
  );
  
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(recentLogs));
}
