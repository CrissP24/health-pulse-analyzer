import { Patient } from '@/types/patient';

const STORAGE_KEY = 'patient_data';

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