import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import PatientForm from '@/components/PatientForm';
import PatientList from '@/components/PatientList';
import PatientDetail from '@/components/PatientDetail';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import PDFExport from '@/components/PDFExport';
import { Patient } from '@/types/patient';
import { loadPatients } from '@/utils/storage';
import { Activity, Users, BarChart3, FileText, Heart } from 'lucide-react';

const Index = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('register');

  useEffect(() => {
    setPatients(loadPatients());
  }, []);

  const handlePatientAdded = () => {
    setPatients(loadPatients());
    setActiveTab('list');
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('detail');
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setActiveTab('list');
  };

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <PatientDetail patient={selectedPatient} onBack={handleBackToList} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-full">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Sistema de Gestión de Pacientes
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plataforma integral para el registro, análisis y seguimiento de datos médicos con cálculo automático de IMC
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-4 h-auto p-1">
              <TabsTrigger value="register" className="flex items-center gap-2 px-4 py-3">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Registro</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2 px-4 py-3">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Pacientes</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 px-4 py-3">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Análisis</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 px-4 py-3">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reportes</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === 'list' && patients.length > 0 && (
              <PDFExport 
                patients={patients} 
                title="Reporte General de Pacientes" 
                isGeneralReport={true}
              />
            )}
          </div>

          <TabsContent value="register" className="space-y-6">
            <PatientForm onPatientAdded={handlePatientAdded} />
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <PatientList patients={patients} onViewPatient={handleViewPatient} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {patients.length > 0 ? (
              <AnalyticsDashboard patients={patients} />
            ) : (
              <Card className="shadow-medical">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No hay datos para analizar</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Registra algunos pacientes para ver estadísticas y gráficas detalladas
                  </p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-primary hover:underline"
                  >
                    Registrar primer paciente
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-medical">
              <CardContent className="p-8">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-4">Centro de Reportes</h3>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Genera reportes detallados en PDF con información completa de pacientes, 
                    estadísticas de IMC y análisis médicos. Los reportes incluyen gráficas 
                    y datos estructurados para uso profesional.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h4 className="text-lg font-semibold mb-2">Reporte General</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Incluye todos los pacientes, estadísticas generales y distribución de IMC
                        </p>
                        <PDFExport 
                          patients={patients} 
                          title="Reporte General de Pacientes" 
                          isGeneralReport={true}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <Activity className="h-12 w-12 text-accent mx-auto mb-4" />
                        <h4 className="text-lg font-semibold mb-2">Reportes Individuales</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Genera reportes específicos desde la vista de cada paciente
                        </p>
                        <button
                          onClick={() => setActiveTab('list')}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                        >
                          Ver pacientes
                        </button>
                      </div>
                    </div>
                  </div>

                  {patients.length === 0 && (
                    <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">
                        No hay pacientes registrados. 
                        <button
                          onClick={() => setActiveTab('register')}
                          className="text-primary hover:underline ml-1"
                        >
                          Registra el primer paciente
                        </button>
                        {' '}para comenzar a generar reportes.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;