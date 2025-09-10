import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConsultationRoom } from '@/types/user';
import { MOCK_CONSULTATION_ROOMS } from '@/utils/auth';
import { Building2, Plus, Edit, Trash2, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConsultationRoomManager: React.FC = () => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ConsultationRoom[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ConsultationRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');

  useEffect(() => {
    // Load rooms from localStorage or use mock data
    const savedRooms = localStorage.getItem('consultationRooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    } else {
      setRooms(MOCK_CONSULTATION_ROOMS);
      localStorage.setItem('consultationRooms', JSON.stringify(MOCK_CONSULTATION_ROOMS));
    }
  }, []);

  const saveRooms = (newRooms: ConsultationRoom[]) => {
    setRooms(newRooms);
    localStorage.setItem('consultationRooms', JSON.stringify(newRooms));
  };

  const resetForm = () => {
    setName('');
    setFloor('');
    setEditingRoom(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !floor) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const roomData: ConsultationRoom = {
      id: editingRoom?.id || crypto.randomUUID(),
      name,
      floor: parseInt(floor),
      isAvailable: editingRoom?.isAvailable ?? true
    };

    let newRooms;
    if (editingRoom) {
      newRooms = rooms.map(room => 
        room.id === editingRoom.id ? roomData : room
      );
    } else {
      newRooms = [...rooms, roomData];
    }

    saveRooms(newRooms);
    resetForm();
    setIsDialogOpen(false);

    toast({
      title: editingRoom ? "Consultorio actualizado" : "Consultorio registrado",
      description: `Consultorio ${editingRoom ? 'actualizado' : 'registrado'} exitosamente`,
    });
  };

  const handleEdit = (room: ConsultationRoom) => {
    setEditingRoom(room);
    setName(room.name);
    setFloor(room.floor.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = (roomId: string) => {
    const newRooms = rooms.filter(room => room.id !== roomId);
    saveRooms(newRooms);
    
    toast({
      title: "Consultorio eliminado",
      description: "El consultorio ha sido eliminado exitosamente",
    });
  };

  const handleToggleAvailability = (roomId: string) => {
    const newRooms = rooms.map(room => 
      room.id === roomId ? { ...room, isAvailable: !room.isAvailable } : room
    );
    saveRooms(newRooms);
    
    toast({
      title: "Disponibilidad actualizada",
      description: "La disponibilidad del consultorio ha sido actualizada",
    });
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.floor.toString().includes(searchTerm)
  );

  const availableRooms = rooms.filter(room => room.isAvailable).length;
  const totalRooms = rooms.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">CONSULTORIOS</h1>
                <p className="text-cyan-100">Gestión de salas de consulta</p>
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
                  Agregar Consultorio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRoom ? 'Editar Consultorio' : 'Nuevo Consultorio'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre del consultorio *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Consultorio 1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="floor">Piso *</Label>
                      <Input
                        id="floor"
                        type="number"
                        min="1"
                        max="10"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                      {editingRoom ? 'Actualizar' : 'Registrar'} Consultorio
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Consultorios</p>
                <p className="text-2xl font-bold">{totalRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold">{availableRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ocupados</p>
                <p className="text-2xl font-bold">{totalRooms - availableRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar consultorios por nombre o piso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardContent className="p-0">
          {filteredRooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultorio</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-600" />
                        {room.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-cyan-600 border-cyan-200">
                        Piso {room.floor}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={room.isAvailable ? 
                          'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }
                      >
                        {room.isAvailable ? 'Disponible' : 'Ocupado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleAvailability(room.id)}
                          className={room.isAvailable ? 
                            'text-red-600 hover:text-red-700' : 
                            'text-green-600 hover:text-green-700'
                          }
                        >
                          {room.isAvailable ? 
                            <XCircle className="h-4 w-4" /> : 
                            <CheckCircle className="h-4 w-4" />
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(room.id)}
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
                <p className="text-red-800 font-semibold text-lg">NO HAY CONSULTORIOS PARA MOSTRAR</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationRoomManager;
