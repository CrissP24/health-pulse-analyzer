import { User, Doctor, Appointment, ConsultationRoom } from '@/types/user';

// Datos simulados de usuarios
export const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'Administrador del Sistema',
    email: 'admin@centroelangado.com',
    isActive: true
  },
  {
    id: '2',
    username: 'doctor1',
    password: 'doctor123',
    role: 'doctor',
    fullName: 'Dr. María González',
    email: 'maria.gonzalez@centroelangado.com',
    isActive: true
  },
  {
    id: '3',
    username: 'doctor2',
    password: 'doctor123',
    role: 'doctor',
    fullName: 'Dr. Carlos Rodríguez',
    email: 'carlos.rodriguez@centroelangado.com',
    isActive: true
  }
];

// Datos simulados de doctores
export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    fullName: 'Dr. María González',
    specialty: 'Pediatría',
    email: 'maria.gonzalez@centroelangado.com',
    phone: '0987654321',
    isActive: true
  },
  {
    id: '2',
    fullName: 'Dr. Carlos Rodríguez',
    specialty: 'Medicina General',
    email: 'carlos.rodriguez@centroelangado.com',
    phone: '0987654322',
    isActive: true
  },
  {
    id: '3',
    fullName: 'Dr. Ana Martínez',
    specialty: 'Nutrición',
    email: 'ana.martinez@centroelangado.com',
    phone: '0987654323',
    isActive: true
  }
];

// Datos simulados de consultorios
export const MOCK_CONSULTATION_ROOMS: ConsultationRoom[] = [
  { id: '1', name: 'Consultorio 1', floor: 1, isAvailable: true },
  { id: '2', name: 'Consultorio 2', floor: 1, isAvailable: true },
  { id: '3', name: 'Consultorio 3', floor: 2, isAvailable: true },
  { id: '4', name: 'Consultorio 4', floor: 2, isAvailable: true }
];

// Funciones de autenticación
export function login(username: string, password: string): User | null {
  const user = MOCK_USERS.find(u => u.username === username && u.password === password && u.isActive);
  return user || null;
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user: User): void {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem('currentUser');
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function hasRole(role: 'admin' | 'doctor'): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}
