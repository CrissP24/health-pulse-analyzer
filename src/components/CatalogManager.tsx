import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NutritionalThreshold, ValidationRange, Recommendation } from '@/types/nutrition';
import { 
  loadThresholds, saveThresholds, addThreshold, updateThreshold,
  loadRanges, saveRanges, addRange, updateRange,
  loadRecommendations, saveRecommendations, addRecommendation
} from '@/utils/catalogs';
import { Settings, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const CatalogManager: React.FC = () => {
  const [thresholds, setThresholds] = useState<NutritionalThreshold[]>([]);
  const [ranges, setRanges] = useState<ValidationRange[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('thresholds');

  // Estados para formularios
  const [thresholdForm, setThresholdForm] = useState({
    ageGroup: '',
    gender: 'male' as 'male' | 'female',
    redMax: 0,
    yellowMax: 0,
    greenMax: 0,
    isActive: true
  });

  const [rangeForm, setRangeForm] = useState({
    ageGroup: '',
    gender: 'male' as 'male' | 'female',
    minWeight: 0,
    maxWeight: 0,
    minHeight: 0,
    maxHeight: 0,
    isActive: true
  });

  const [recommendationForm, setRecommendationForm] = useState({
    status: 'red' as 'red' | 'yellow' | 'green',
    title: '',
    message: '',
    action: '',
    priority: 1,
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setThresholds(loadThresholds());
    setRanges(loadRanges());
    setRecommendations(loadRecommendations());
  };

  const handleSaveThreshold = () => {
    if (editingItem) {
      updateThreshold(editingItem.id, thresholdForm);
    } else {
      addThreshold(thresholdForm);
    }
    loadData();
    resetForms();
    setIsDialogOpen(false);
  };

  const handleSaveRange = () => {
    if (editingItem) {
      updateRange(editingItem.id, rangeForm);
    } else {
      addRange(rangeForm);
    }
    loadData();
    resetForms();
    setIsDialogOpen(false);
  };

  const handleSaveRecommendation = () => {
    if (editingItem) {
      const updatedRecommendations = recommendations.map(r => 
        r.id === editingItem.id ? { ...r, ...recommendationForm } : r
      );
      saveRecommendations(updatedRecommendations);
    } else {
      addRecommendation(recommendationForm);
    }
    loadData();
    resetForms();
    setIsDialogOpen(false);
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setActiveTab(type);
    
    if (type === 'thresholds') {
      setThresholdForm({
        ageGroup: item.ageGroup,
        gender: item.gender,
        redMax: item.redMax,
        yellowMax: item.yellowMax,
        greenMax: item.greenMax,
        isActive: item.isActive
      });
    } else if (type === 'ranges') {
      setRangeForm({
        ageGroup: item.ageGroup,
        gender: item.gender,
        minWeight: item.minWeight,
        maxWeight: item.maxWeight,
        minHeight: item.minHeight,
        maxHeight: item.maxHeight,
        isActive: item.isActive
      });
    } else if (type === 'recommendations') {
      setRecommendationForm({
        status: item.status,
        title: item.title,
        message: item.message,
        action: item.action,
        priority: item.priority,
        isActive: item.isActive
      });
    }
    
    setIsDialogOpen(true);
  };

  const resetForms = () => {
    setEditingItem(null);
    setThresholdForm({
      ageGroup: '',
      gender: 'male',
      redMax: 0,
      yellowMax: 0,
      greenMax: 0,
      isActive: true
    });
    setRangeForm({
      ageGroup: '',
      gender: 'male',
      minWeight: 0,
      maxWeight: 0,
      minHeight: 0,
      maxHeight: 0,
      isActive: true
    });
    setRecommendationForm({
      status: 'red',
      title: '',
      message: '',
      action: '',
      priority: 1,
      isActive: true
    });
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  );

  const getNutritionalStatusBadge = (status: 'red' | 'yellow' | 'green') => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
    };

    const labels = {
      red: 'Rojo',
      yellow: 'Amarillo',
      green: 'Verde'
    };

    return (
      <Badge className={`${colors[status]} border`}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Gestión de Catálogos</h1>
              <p className="text-green-100">Administrar umbrales, rangos de validación y recomendaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="thresholds">Umbrales Nutricionales</TabsTrigger>
          <TabsTrigger value="ranges">Rangos de Validación</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        {/* Umbrales Nutricionales */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Umbrales Nutricionales</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForms(); setActiveTab('thresholds'); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Umbral
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Editar Umbral' : 'Nuevo Umbral'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Grupo Etario</Label>
                      <Select value={thresholdForm.ageGroup} onValueChange={(value) => 
                        setThresholdForm({...thresholdForm, ageGroup: value})
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3-5">3-5 años</SelectItem>
                          <SelectItem value="6-10">6-10 años</SelectItem>
                          <SelectItem value="11-17">11-17 años</SelectItem>
                          <SelectItem value="18+">18+ años</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Género</Label>
                      <Select value={thresholdForm.gender} onValueChange={(value: 'male' | 'female') => 
                        setThresholdForm({...thresholdForm, gender: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>Rojo (máx)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={thresholdForm.redMax}
                          onChange={(e) => setThresholdForm({...thresholdForm, redMax: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Amarillo (máx)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={thresholdForm.yellowMax}
                          onChange={(e) => setThresholdForm({...thresholdForm, yellowMax: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Verde (máx)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={thresholdForm.greenMax}
                          onChange={(e) => setThresholdForm({...thresholdForm, greenMax: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveThreshold}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo Etario</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Rojo (máx)</TableHead>
                    <TableHead>Amarillo (máx)</TableHead>
                    <TableHead>Verde (máx)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thresholds.map((threshold) => (
                    <TableRow key={threshold.id}>
                      <TableCell>{threshold.ageGroup}</TableCell>
                      <TableCell>{threshold.gender === 'male' ? 'Masculino' : 'Femenino'}</TableCell>
                      <TableCell>{threshold.redMax}</TableCell>
                      <TableCell>{threshold.yellowMax}</TableCell>
                      <TableCell>{threshold.greenMax}</TableCell>
                      <TableCell>{getStatusBadge(threshold.isActive)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(threshold, 'thresholds')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rangos de Validación */}
        <TabsContent value="ranges">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rangos de Validación</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForms(); setActiveTab('ranges'); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Rango
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Editar Rango' : 'Nuevo Rango'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Grupo Etario</Label>
                      <Select value={rangeForm.ageGroup} onValueChange={(value) => 
                        setRangeForm({...rangeForm, ageGroup: value})
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3-5">3-5 años</SelectItem>
                          <SelectItem value="6-10">6-10 años</SelectItem>
                          <SelectItem value="11-17">11-17 años</SelectItem>
                          <SelectItem value="18+">18+ años</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Género</Label>
                      <Select value={rangeForm.gender} onValueChange={(value: 'male' | 'female') => 
                        setRangeForm({...rangeForm, gender: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Peso Mín (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={rangeForm.minWeight}
                          onChange={(e) => setRangeForm({...rangeForm, minWeight: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Peso Máx (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={rangeForm.maxWeight}
                          onChange={(e) => setRangeForm({...rangeForm, maxWeight: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Talla Mín (m)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={rangeForm.minHeight}
                          onChange={(e) => setRangeForm({...rangeForm, minHeight: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Talla Máx (m)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={rangeForm.maxHeight}
                          onChange={(e) => setRangeForm({...rangeForm, maxHeight: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveRange}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo Etario</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>Talla (m)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranges.map((range) => (
                    <TableRow key={range.id}>
                      <TableCell>{range.ageGroup}</TableCell>
                      <TableCell>{range.gender === 'male' ? 'Masculino' : 'Femenino'}</TableCell>
                      <TableCell>{range.minWeight} - {range.maxWeight}</TableCell>
                      <TableCell>{range.minHeight} - {range.maxHeight}</TableCell>
                      <TableCell>{getStatusBadge(range.isActive)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(range, 'ranges')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recomendaciones */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recomendaciones</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForms(); setActiveTab('recommendations'); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Recomendación
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Editar Recomendación' : 'Nueva Recomendación'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Estado Nutricional</Label>
                      <Select value={recommendationForm.status} onValueChange={(value: 'red' | 'yellow' | 'green') => 
                        setRecommendationForm({...recommendationForm, status: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="red">Rojo (Crítico)</SelectItem>
                          <SelectItem value="yellow">Amarillo (Riesgo)</SelectItem>
                          <SelectItem value="green">Verde (Normal)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={recommendationForm.title}
                        onChange={(e) => setRecommendationForm({...recommendationForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Mensaje</Label>
                      <Input
                        value={recommendationForm.message}
                        onChange={(e) => setRecommendationForm({...recommendationForm, message: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Acción Recomendada</Label>
                      <Input
                        value={recommendationForm.action}
                        onChange={(e) => setRecommendationForm({...recommendationForm, action: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Prioridad</Label>
                      <Input
                        type="number"
                        min="1"
                        max="3"
                        value={recommendationForm.priority}
                        onChange={(e) => setRecommendationForm({...recommendationForm, priority: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveRecommendation}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((recommendation) => (
                    <TableRow key={recommendation.id}>
                      <TableCell>
                        {getNutritionalStatusBadge(recommendation.status)}
                      </TableCell>
                      <TableCell>{recommendation.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{recommendation.message}</TableCell>
                      <TableCell className="max-w-xs truncate">{recommendation.action}</TableCell>
                      <TableCell>{recommendation.priority}</TableCell>
                      <TableCell>{getStatusBadge(recommendation.isActive)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(recommendation, 'recommendations')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatalogManager;
