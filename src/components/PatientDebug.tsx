import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/types/patient';
import { loadPatients } from '@/utils/storage';

interface PatientDebugProps {
  patients: Patient[];
}

const PatientDebug: React.FC<PatientDebugProps> = ({ patients }) => {
  const localStoragePatients = loadPatients();

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm">Debug - Pacientes</CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-2">
          <p><strong>Pacientes en estado:</strong> {patients.length}</p>
          <p><strong>Pacientes en localStorage:</strong> {localStoragePatients.length}</p>
          <div>
            <strong>Pacientes en estado:</strong>
            <ul className="ml-4">
              {patients.map(p => (
                <li key={p.id}>- {p.fullName} ({p.age} años)</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Pacientes en localStorage:</strong>
            <ul className="ml-4">
              {localStoragePatients.map(p => (
                <li key={p.id}>- {p.fullName} ({p.age} años)</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientDebug;
