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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FollowUp, Alert as AlertType } from '@/types/nutrition';
import { Patient } from '@/types/patient';
import { loadFollowUps, saveFollowUps, addFollowUp, loadAlerts } from '@/utils/storage';
import { getCurrentUser } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Edit, CheckCircle, XCircle, Clock, User, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClinicalFollowUpProps {
  patients: Patient[];
}

const ClinicalFollowUp: React.FC<ClinicalFollowUpProps> = ({ patients }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const { toast } = useToast();

  // Estados del formulario
  const [formData, setFormData] = useState({
    alertId: '',
    patientId: '',
    scheduledDate: '',
    professionalId: '',
    professionalName: '',
    notes: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFollowUps(loadFollowUps());
    setAlerts(loadAlerts());
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.fullName : 'Paciente no encontrado';
  };

  const getAlertInfo = (alertId: string) => {
    return alerts.find(a => a.id === alertId);
  };

  const handleCreateFollowUp = (alert: AlertType) => {
    setSelectedAlert(alert);
    setFormData({
      alertId: alert.id,
      patientId: alert.patientId,
      scheduledDate: '',
      professionalId: getCurrentUser()?.id || '',
      professionalName: getCurrentUser()?.fullName || '',
      notes: '',
      status: 'scheduled'
    });
    setIsDialogOpen(true);
  };

  const handleSaveFollowUp = () => {
    if (!formData.scheduledDate || !formData.notes) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const followUp: FollowUp = {
      id: editingFollowUp?.id || crypto.randomUUID(),
      alertId: formData.alertId,
      patientId: formData.patientId,
      scheduledDate: formData.scheduledDate,
      professionalId: formData.professionalId,
      professionalName: formData.professionalName,
      status: formData.status,
      notes: formData.notes,
      completedAt: formData.status === 'completed' ? new Date().toISOString() : undefined,
      createdAt: editingFollowUp?.createdAt || new Date().toISOString(),
      createdBy: getCurrentUser()?.id || ''
    };

    if (editingFollowUp) {
      const updatedFollowUps = followUps.map(f => f.id === editingFollowUp.id ? followUp : f);
      setFollowUps(updatedFollowUps);
      saveFollowUps(updatedFollowUps);
    } else {
      addFollowUp(followUp);
      loadData();
    }

    toast({
      title: "Seguimiento guardado",
      description: `Seguimiento ${editingFollowUp ? 'actualizado' : 'creado'} exitosamente`,
    });

    resetForm();
  };

  const handleEditFollowUp = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    setFormData({
      alertId: followUp.alertId,
      patientId: followUp.patientId,
      scheduledDate: followUp.scheduledDate,
      professionalId: followUp.professionalId,
      professionalName: followUp.professionalName,
      notes: followUp.notes || '',
      status: followUp.status
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (followUpId: string, newStatus: FollowUp['status']) => {
    const updatedFollowUps = followUps.map(f => {
      if (f.id === followUpId) {
        return {
          ...f,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : f.completedAt
        };
      }
      return f;
    });
    setFollowUps(updatedFollowUps);
    saveFollowUps(updatedFollowUps);

    toast({
      title: "Estado actualizado",
      description: `Seguimiento marcado como ${getStatusLabel(newStatus)}`,
    });
  };

  const resetForm = () => {
    setEditingFollowUp(null);
    setSelectedAlert(null);
    setFormData({
      alertId: '',
      patientId: '',
      scheduledDate: '',
      professionalId: '',
      professionalName: '',
      notes: '',
      status: 'scheduled'
    });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: FollowUp['status']) => {
    const variants = {
      scheduled: 'default',
      completed: 'default',
      cancelled: 'destructive',
      no_show: 'secondary'
    } as const;

    const labels = {
      scheduled: 'Programado',
      completed: 'Completado',
      cancelled: 'Cancelado',
      no_show: 'No se presentó'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getStatusLabel = (status: FollowUp['status']) => {
    const labels = {
      scheduled: 'Programado',
      completed: 'Completado',
      cancelled: 'Cancelado',
      no_show: 'No se presentó'
    };
    return labels[status];
  };

  const getAlertBadge = (status: AlertType['status']) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200'
    };

    const labels = {
      red: 'Crítico',
      yellow: 'Riesgo',
      green: 'Normal'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // Filtrar alertas que no tienen seguimiento
  const unresolvedAlerts = alerts.filter(alert => 
    !alert.isResolved && 
    !followUps.some(f => f.alertId === alert.id)
  );

  // Filtrar alertas críticas (rojas)
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.status === 'red');

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Seguimiento Clínico</h1>
              <p className="text-orange-100">Gestión de planes de seguimiento para alertas nutricionales</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticas */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {criticalAlerts.length} alerta(s) crítica(s) sin seguimiento
              </span>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => setSelectedAlert(criticalAlerts[0])}
              >
                Ver Alertas
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Pendientes de Seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unresolvedAlerts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay alertas pendientes de seguimiento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unresolvedAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{alert.title}</h3>
                      {getAlertBadge(alert.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Paciente: {getPatientName(alert.patientId)}
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateFollowUp(alert)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Seguimiento
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seguimientos Activos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Seguimientos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {followUps.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay seguimientos programados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {followUps.slice(0, 5).map((followUp) => {
                  const alert = getAlertInfo(followUp.alertId);
                  return (
                    <div key={followUp.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {alert?.title || 'Seguimiento'}
                        </h3>
                        {getStatusBadge(followUp.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Paciente: {getPatientName(followUp.patientId)}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Programado: {format(new Date(followUp.scheduledDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditFollowUp(followUp)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {followUp.status === 'scheduled' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleStatusChange(followUp.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusChange(followUp.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla Completa de Seguimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Seguimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Alerta</TableHead>
                <TableHead>Fecha Programada</TableHead>
                <TableHead>Profesional</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followUps.map((followUp) => {
                const alert = getAlertInfo(followUp.alertId);
                return (
                  <TableRow key={followUp.id}>
                    <TableCell>{getPatientName(followUp.patientId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{alert?.title || 'N/A'}</span>
                        {alert && getAlertBadge(alert.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(followUp.scheduledDate), "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>{followUp.professionalName}</TableCell>
                    <TableCell>{getStatusBadge(followUp.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditFollowUp(followUp)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {followUp.status === 'scheduled' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleStatusChange(followUp.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar seguimiento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFollowUp ? 'Editar Seguimiento' : 'Crear Seguimiento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAlert && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm">Alerta Asociada</h4>
                <p className="text-sm text-gray-600">{selectedAlert.title}</p>
                <p className="text-xs text-gray-500">
                  Paciente: {getPatientName(selectedAlert.patientId)}
                </p>
              </div>
            )}

            <div>
              <Label>Fecha Programada *</Label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label>Profesional Responsable</Label>
              <Input
                value={formData.professionalName}
                onChange={(e) => setFormData({...formData, professionalName: e.target.value})}
                placeholder="Nombre del profesional"
              />
            </div>

            <div>
              <Label>Estado</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: FollowUp['status']) => 
                  setFormData({...formData, status: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="no_show">No se presentó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notas *</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Observaciones y plan de seguimiento..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSaveFollowUp}>
                {editingFollowUp ? 'Actualizar' : 'Crear'} Seguimiento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicalFollowUp;
