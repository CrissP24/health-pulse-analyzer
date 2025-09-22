import { Patient } from '@/types/patient';
import { Alert, FollowUp, ReportData, NutritionalStats } from '@/types/nutrition';

const STORAGE_KEY = 'patient_data';
const ALERTS_STORAGE_KEY = 'nutritional_alerts';
const FOLLOWUPS_STORAGE_KEY = 'clinical_followups';
const REPORTS_STORAGE_KEY = 'nutritional_reports';
const STATS_STORAGE_KEY = 'nutritional_stats';

export function savePatients(patients: Patient[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (error) {
    console.error('Error saving patients to localStorage:', error);
  }
}

export function loadPatients(): Patient[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading patients from localStorage:', error);
    return [];
  }
}

export function addPatient(patient: Patient): void {
  const patients = loadPatients();
  patients.push(patient);
  savePatients(patients);
}

export function updatePatient(updatedPatient: Patient): void {
  const patients = loadPatients();
  const index = patients.findIndex(p => p.id === updatedPatient.id);
  if (index !== -1) {
    patients[index] = updatedPatient;
    savePatients(patients);
  }
}

export function deletePatient(patientId: string): void {
  const patients = loadPatients();
  const filteredPatients = patients.filter(p => p.id !== patientId);
  savePatients(filteredPatients);
}

// RF-4: Gestión de alertas
export function saveAlerts(alerts: Alert[]): void {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Error saving alerts:', error);
  }
}

export function loadAlerts(): Alert[] {
  try {
    const data = localStorage.getItem(ALERTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading alerts:', error);
    return [];
  }
}

export function addAlert(alert: Alert): void {
  const alerts = loadAlerts();
  alerts.push(alert);
  saveAlerts(alerts);
}

export function updateAlert(alertId: string, updates: Partial<Alert>): void {
  const alerts = loadAlerts();
  const index = alerts.findIndex(a => a.id === alertId);
  if (index !== -1) {
    alerts[index] = { ...alerts[index], ...updates };
    saveAlerts(alerts);
  }
}

// RF-8: Gestión de seguimientos
export function saveFollowUps(followUps: FollowUp[]): void {
  try {
    localStorage.setItem(FOLLOWUPS_STORAGE_KEY, JSON.stringify(followUps));
  } catch (error) {
    console.error('Error saving follow-ups:', error);
  }
}

export function loadFollowUps(): FollowUp[] {
  try {
    const data = localStorage.getItem(FOLLOWUPS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading follow-ups:', error);
    return [];
  }
}

export function addFollowUp(followUp: FollowUp): void {
  const followUps = loadFollowUps();
  followUps.push(followUp);
  saveFollowUps(followUps);
}

// RF-9: Gestión de reportes
export function saveReports(reports: ReportData[]): void {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error('Error saving reports:', error);
  }
}

export function loadReports(): ReportData[] {
  try {
    const data = localStorage.getItem(REPORTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading reports:', error);
    return [];
  }
}

export function addReport(report: ReportData): void {
  const reports = loadReports();
  reports.push(report);
  saveReports(reports);
}

// RF-2: Gestión de estadísticas
export function saveStats(stats: NutritionalStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

export function loadStats(): NutritionalStats | null {
  try {
    const data = localStorage.getItem(STATS_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading stats:', error);
    return null;
  }
}