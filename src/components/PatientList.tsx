import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Patient, PatientFilters } from '@/types/patient';
import { getBMICategoryInfo, formatBMI } from '@/utils/bmi';
import { Eye, Users, Search, Filter } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onViewPatient: (patient: Patient) => void;
}

export default function PatientList({ patients, onViewPatient }: PatientListProps) {
  const [filters, setFilters] = useState<PatientFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient => {
    // Search filter
    if (searchTerm && !patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Gender filter
    if (filters.gender && filters.gender !== 'all' && patient.gender !== filters.gender) {
      return false;
    }
    
    // Age range filter
    if (filters.ageRange) {
      if (patient.age < filters.ageRange.min || patient.age > filters.ageRange.max) {
        return false;
      }
    }
    
    // BMI category filter
    if (filters.bmiCategory && patient.bmiCategory !== filters.bmiCategory) {
      return false;
    }
    
    return true;
  });

  const getBMIBadgeColor = (category: string) => {
    const info = getBMICategoryInfo(category as any);
    switch (category) {
      case 'underweight':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'normal':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'overweight':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'obesity':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Masculino';
      case 'female': return 'Femenino';
      case 'other': return 'Otro';
      default: return gender;
    }
  };

  return (
    <Card className="shadow-medical">
      <CardHeader className="bg-gradient-medical text-accent-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Lista de Pacientes ({filteredPatients.length})
        </CardTitle>
        <CardDescription className="text-accent-foreground/80">
          Gestiona y visualiza todos los pacientes registrados
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtros</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.gender || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, gender: value === 'all' ? undefined : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Femenino</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.bmiCategory || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, bmiCategory: value === 'all' ? undefined : value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría IMC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="underweight">Bajo peso</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="overweight">Sobrepeso</SelectItem>
                <SelectItem value="obesity">Obesidad</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setSearchTerm('');
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Table */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron pacientes</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Estatura</TableHead>
                  <TableHead>IMC</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{patient.fullName}</TableCell>
                    <TableCell>{patient.age} años</TableCell>
                    <TableCell>{getGenderLabel(patient.gender)}</TableCell>
                    <TableCell>{patient.weight} kg</TableCell>
                    <TableCell>{patient.height} cm</TableCell>
                    <TableCell className="font-mono">{formatBMI(patient.bmi)}</TableCell>
                    <TableCell>
                      <Badge className={getBMIBadgeColor(patient.bmiCategory)}>
                        {getBMICategoryInfo(patient.bmiCategory).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => onViewPatient(patient)}
                        className="h-8"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}