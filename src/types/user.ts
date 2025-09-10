export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'doctor';
  fullName: string;
  email: string;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  roomId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface ConsultationRoom {
  id: string;
  name: string;
  floor: number;
  isAvailable: boolean;
}
