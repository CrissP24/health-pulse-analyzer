import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Patient } from '@/types/patient';
import { Appointment, Doctor, ConsultationRoom } from '@/types/user';
import { MOCK_DOCTORS, MOCK_CONSULTATION_ROOMS } from '@/utils/auth';
import { Calendar, Clock, User, Building2, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppointmentManagerProps {
  patients: Patient[];
  onAppointmentUpdate: (appointments: Appointment[]) => void;
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ patients, onAppointmentUpdate }) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Form state
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Load appointments from localStorage
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, []);

  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('appointments', JSON.stringify(newAppointments));
    onAppointmentUpdate(newAppointments);
  };

  const resetForm = () => {
    setPatientId('');
    setDoctorId('');
    setRoomId('');
    setDate('');
    setTime('');
    setNotes('');
    setEditingAppointment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !doctorId || !roomId || !date || !time) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId);
    const room = MOCK_CONSULTATION_ROOMS.find(r => r.id === roomId);

    if (!patient || !doctor || !room) {
      toast({
        title: "Error",
        description: "Datos no válidos seleccionados",
        variant: "destructive"
      });
      return;
    }

    const appointmentData: Appointment = {
      id: editingAppointment?.id || crypto.randomUUID(),
      patientId,
      doctorId,
      roomId,
      date,
      time,
      status: editingAppointment?.status || 'scheduled',
      notes,
      createdAt: editingAppointment?.createdAt || new Date().toISOString(),
    };

    let newAppointments;
    if (editingAppointment) {
      newAppointments = appointments.map(apt => 
        apt.id === editingAppointment.id ? appointmentData : apt
      );
    } else {
      newAppointments = [...appointments, appointmentData];
    }

    saveAppointments(newAppointments);
    resetForm();
    setIsDialogOpen(false);

    toast({
      title: editingAppointment ? "Cita actualizada" : "Cita creada",
      description: `Cita ${editingAppointment ? 'actualizada' : 'creada'} exitosamente`,
    });
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setPatientId(appointment.patientId);
    setDoctorId(appointment.doctorId);
    setRoomId(appointment.roomId || '');
    setDate(appointment.date);
    setTime(appointment.time);
    setNotes(appointment.notes || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (appointmentId: string) => {
    const newAppointments = appointments.filter(apt => apt.id !== appointmentId);
    saveAppointments(newAppointments);
    
    toast({
      title: "Cita eliminada",
      description: "La cita ha sido eliminada exitosamente",
    });
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    const newAppointments = appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    );
    saveAppointments(newAppointments);
    
    toast({
      title: "Estado actualizado",
      description: "El estado de la cita ha sido actualizado",
    });
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completada', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.fullName || 'Paciente no encontrado';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId);
    return doctor?.fullName || 'Doctor no encontrado';
  };

  const getRoomName = (roomId: string) => {
    const room = MOCK_CONSULTATION_ROOMS.find(r => r.id === roomId);
    return room?.name || 'Consultorio no encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">CITAS</h1>
                <p className="text-cyan-100">Gestión de citas médicas</p>
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
                  Agregar Citas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient">Paciente *</Label>
                      <Select value={patientId} onValueChange={setPatientId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.fullName} - {patient.cedula}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="doctor">Doctor *</Label>
                      <Select value={doctorId} onValueChange={setDoctorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_DOCTORS.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.fullName} - {doctor.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Fecha *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label htmlFor="time">Hora *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="room">Consultorio *</Label>
                    <Select value={roomId} onValueChange={setRoomId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar consultorio" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_CONSULTATION_ROOMS.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} - Piso {room.floor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observaciones sobre la cita..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                      {editingAppointment ? 'Actualizar' : 'Crear'} Cita
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardContent className="p-0">
          {appointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Consultorio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Opciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment, index) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{getPatientName(appointment.patientId)}</TableCell>
                    <TableCell>{getDoctorName(appointment.doctorId)}</TableCell>
                    <TableCell>{getRoomName(appointment.roomId || '')}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleStatusChange(appointment.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <div className="bg-red-100 border border-red-300 rounded-lg p-6">
                <p className="text-red-800 font-semibold text-lg">NO HAY CITAS PARA MOSTRAR</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentManager;
