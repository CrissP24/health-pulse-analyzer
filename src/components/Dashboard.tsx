import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Users, UserCheck, Building2, Calculator, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Sistema de Gestión de Centro Medico
              </h1>
              <p className="text-cyan-100 text-lg">
                Bienvenido a <strong>Centro Medico El Anegado</strong>! Un Sistema de Citas Medicas útil para la comunidad en general.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Functions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-cyan-600" />
            Nuestras funciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="h-8 w-8 text-cyan-600" />
              <div>
                <h3 className="font-semibold">Gestión de Citas</h3>
                <p className="text-sm text-gray-600">Programar y administrar citas médicas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <UserCheck className="h-8 w-8 text-cyan-600" />
              <div>
                <h3 className="font-semibold">Gestión de Medicos</h3>
                <p className="text-sm text-gray-600">Administrar información de doctores</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-8 w-8 text-cyan-600" />
              <div>
                <h3 className="font-semibold">Gestión de Pacientes</h3>
                <p className="text-sm text-gray-600">Registrar y gestionar pacientes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Building2 className="h-8 w-8 text-cyan-600" />
              <div>
                <h3 className="font-semibold">Gestión de Consultorios</h3>
                <p className="text-sm text-gray-600">Administrar salas de consulta</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Calculator className="h-8 w-8 text-cyan-600" />
              <div>
                <h3 className="font-semibold">Calculo del IMC</h3>
                <p className="text-sm text-gray-600">Calcular IMC para niños y seguimiento</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-8 w-8 text-cyan-600" />
              <div>
                <h3 className="font-semibold">Gestión de Usuarios</h3>
                <p className="text-sm text-gray-600">Usuarios con acceso al sistema</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pacientes</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Citas Hoy</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Doctores</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Consultorios</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
