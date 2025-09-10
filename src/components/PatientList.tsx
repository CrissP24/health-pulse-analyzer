import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Patient, PatientFilters } from '@/types/patient';
import { Eye, Users, Search, Filter, Phone, MapPin, Calendar } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onViewPatient: (patient: Patient) => void;
}

export default function PatientList({ patients, onViewPatient }: PatientListProps) {
  const [filters, setFilters] = useState<PatientFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient => {
    // Search filter
    if (searchTerm && 
        !patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !patient.cedula.includes(searchTerm) &&
        !patient.phone.includes(searchTerm)) {
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
    
    return true;
  });

  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'bg-blue-100 text-blue-800';
      case 'female':
        return 'bg-pink-100 text-pink-800';
      case 'other':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                placeholder="Buscar por nombre, cédula o teléfono..."
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
              value={filters.ageRange ? 'custom' : 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  setFilters(prev => ({ ...prev, ageRange: undefined }));
                } else if (value === 'children') {
                  setFilters(prev => ({ ...prev, ageRange: { min: 3, max: 10 } }));
                } else if (value === 'teens') {
                  setFilters(prev => ({ ...prev, ageRange: { min: 11, max: 17 } }));
                } else if (value === 'adults') {
                  setFilters(prev => ({ ...prev, ageRange: { min: 18, max: 65 } }));
                } else if (value === 'seniors') {
                  setFilters(prev => ({ ...prev, ageRange: { min: 65, max: 120 } }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rango de edad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las edades</SelectItem>
                <SelectItem value="children">Niños (3-10 años)</SelectItem>
                <SelectItem value="teens">Adolescentes (11-17 años)</SelectItem>
                <SelectItem value="adults">Adultos (18-65 años)</SelectItem>
                <SelectItem value="seniors">Adultos mayores (65+ años)</SelectItem>
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
                  <TableHead>Cédula</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{patient.fullName}</TableCell>
                    <TableCell className="font-mono text-sm">{patient.cedula}</TableCell>
                    <TableCell>{patient.age} años</TableCell>
                    <TableCell>
                      <Badge className={getGenderBadgeColor(patient.gender)}>
                        {getGenderLabel(patient.gender)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {patient.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 max-w-xs truncate">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(patient.registrationDate).toLocaleDateString()}
                      </div>
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