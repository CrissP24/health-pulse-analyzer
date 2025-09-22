import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Calendar, 
  Users, 
  UserCheck, 
  Building2, 
  Calculator, 
  User as UserIcon,
  LogOut,
  Heart,
  FileText,
  TrendingUp,
  Settings,
  BarChart3,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import { getCurrentUser, logout } from '@/utils/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const user = getCurrentUser();

  const menuItems = [
    { id: 'dashboard', label: 'Centro Medico', icon: Home },
    { id: 'nutritional-dashboard', label: 'Panel Nutricional', icon: BarChart3 },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'bmi-calculator', label: 'Evaluación Nutricional', icon: Calculator },
    { id: 'followup', label: 'Seguimiento Clínico', icon: Stethoscope },
    { id: 'catalogs', label: 'Catálogos', icon: Settings },
    { id: 'advanced-reports', label: 'Reportes Avanzados', icon: ClipboardList },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'doctors', label: 'Medicos', icon: UserCheck },
    { id: 'consultation-rooms', label: 'Consultorios', icon: Building2 },
    { id: 'reports', label: 'Reportes Básicos', icon: FileText },
    { id: 'users', label: 'Usuario', icon: UserIcon },
  ];

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-600 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-cyan-600">
              Centro de Salud <span className="text-cyan-800">El Anegado</span>
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 border-cyan-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-cyan-600 text-white py-4">
        <div className="text-center">
          <p className="text-sm">Copyright © 2025 SUBCENTRO EL ANEGADO</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
