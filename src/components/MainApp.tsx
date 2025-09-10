import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Dashboard from './Dashboard';
import PatientForm from './PatientForm';
import PatientList from './PatientList';
import PatientDetail from './PatientDetail';
import BMICalculator from './BMICalculator';
import AppointmentManager from './AppointmentManager';
import DoctorManager from './DoctorManager';
import ConsultationRoomManager from './ConsultationRoomManager';
import UserManager from './UserManager';
import Reports from './Reports';
import { Patient } from '@/types/patient';
import { Appointment } from '@/types/user';
import { loadPatients, savePatients } from '@/utils/storage';

interface MainAppProps {
  onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    setPatients(loadPatients());
  }, []);

  // Reload patients when switching to BMI calculator or patients tab
  useEffect(() => {
    if (activeTab === 'bmi-calculator' || activeTab === 'patients') {
      setPatients(loadPatients());
    }
  }, [activeTab]);

  const handlePatientAdded = () => {
    setPatients(loadPatients());
  };

  const handlePatientUpdate = (updatedPatient: Patient) => {
    const updatedPatients = patients.map(p => 
      p.id === updatedPatient.id ? updatedPatient : p
    );
    setPatients(updatedPatients);
    
    // Update localStorage using the storage utility
    savePatients(updatedPatients);
  };

  const handleAppointmentUpdate = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('patient-detail');
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setActiveTab('patients');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'patients':
        return (
          <div className="space-y-6">
            <PatientForm onPatientAdded={handlePatientAdded} />
            <PatientList patients={patients} onViewPatient={handleViewPatient} />
          </div>
        );
      
      case 'patient-detail':
        return selectedPatient ? (
          <PatientDetail patient={selectedPatient} onBack={handleBackToList} />
        ) : (
          <div>Paciente no encontrado</div>
        );
      
      case 'bmi-calculator':
        return (
          <BMICalculator 
            patients={patients} 
            onPatientUpdate={handlePatientUpdate}
          />
        );
      
      case 'appointments':
        return (
          <AppointmentManager 
            patients={patients}
            onAppointmentUpdate={handleAppointmentUpdate}
          />
        );
      
      case 'doctors':
        return <DoctorManager />;
      
      case 'consultation-rooms':
        return <ConsultationRoomManager />;
      
      case 'users':
        return <UserManager />;
      
      case 'reports':
        return (
          <Reports 
            patients={patients}
            appointments={appointments}
          />
        );
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default MainApp;
