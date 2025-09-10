import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Doctor } from '@/types/user';
import { MOCK_DOCTORS } from '@/utils/auth';
import { UserCheck, Plus, Edit, Trash2, Phone, Mail, Stethoscope, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DoctorManager: React.FC = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Load doctors from localStorage or use mock data
    const savedDoctors = localStorage.getItem('doctors');
    if (savedDoctors) {
      setDoctors(JSON.parse(savedDoctors));
    } else {
      setDoctors(MOCK_DOCTORS);
      localStorage.setItem('doctors', JSON.stringify(MOCK_DOCTORS));
    }
  }, []);

  const saveDoctors = (newDoctors: Doctor[]) => {
    setDoctors(newDoctors);
    localStorage.setItem('doctors', JSON.stringify(newDoctors));
  };

  const resetForm = () => {
    setFullName('');
    setSpecialty('');
    setEmail('');
    setPhone('');
    setEditingDoctor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !specialty || !email || !phone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const doctorData: Doctor = {
      id: editingDoctor?.id || crypto.randomUUID(),
      fullName,
      specialty,
      email,
      phone,
      isActive: editingDoctor?.isActive ?? true
    };

    let newDoctors;
    if (editingDoctor) {
      newDoctors = doctors.map(doc => 
        doc.id === editingDoctor.id ? doctorData : doc
      );
    } else {
      newDoctors = [...doctors, doctorData];
    }

    saveDoctors(newDoctors);
    resetForm();
    setIsDialogOpen(false);

    toast({
      title: editingDoctor ? "Doctor actualizado" : "Doctor registrado",
      description: `Doctor ${editingDoctor ? 'actualizado' : 'registrado'} exitosamente`,
    });
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFullName(doctor.fullName);
    setSpecialty(doctor.specialty);
    setEmail(doctor.email);
    setPhone(doctor.phone);
    setIsDialogOpen(true);
  };

  const handleDelete = (doctorId: string) => {
    const newDoctors = doctors.filter(doc => doc.id !== doctorId);
    saveDoctors(newDoctors);
    
    toast({
      title: "Doctor eliminado",
      description: "El doctor ha sido eliminado exitosamente",
    });
  };

  const handleToggleStatus = (doctorId: string) => {
    const newDoctors = doctors.map(doc => 
      doc.id === doctorId ? { ...doc, isActive: !doc.isActive } : doc
    );
    saveDoctors(newDoctors);
    
    toast({
      title: "Estado actualizado",
      description: "El estado del doctor ha sido actualizado",
    });
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const specialties = [
    'Pediatría', 'Medicina General', 'Nutrición', 'Cardiología', 
    'Dermatología', 'Ginecología', 'Oftalmología', 'Ortopedia',
    'Psiquiatría', 'Radiología', 'Cirugía', 'Anestesiología'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">MÉDICOS</h1>
                <p className="text-cyan-100">Gestión de personal médico</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Médico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingDoctor ? 'Editar Médico' : 'Nuevo Médico'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nombre completo *</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Juan Pérez"
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialty">Especialidad *</Label>
                      <select
                        id="specialty"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Seleccionar especialidad</option>
                        {specialties.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@centroelangado.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0987654321"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                      {editingDoctor ? 'Actualizar' : 'Registrar'} Médico
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar médicos por nombre, especialidad o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardContent className="p-0">
          {filteredDoctors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-cyan-600" />
                        {doctor.fullName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-cyan-600 border-cyan-200">
                        {doctor.specialty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {doctor.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {doctor.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={doctor.isActive ? 
                          'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }
                      >
                        {doctor.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(doctor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(doctor.id)}
                          className={doctor.isActive ? 
                            'text-red-600 hover:text-red-700' : 
                            'text-green-600 hover:text-green-700'
                          }
                        >
                          {doctor.isActive ? 
                            <XCircle className="h-4 w-4" /> : 
                            <CheckCircle className="h-4 w-4" />
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(doctor.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <div className="bg-red-100 border border-red-300 rounded-lg p-6">
                <p className="text-red-800 font-semibold text-lg">NO HAY MÉDICOS PARA MOSTRAR</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorManager;
