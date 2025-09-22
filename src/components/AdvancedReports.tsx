import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportData, ReportFilters } from '@/types/nutrition';
import { Patient } from '@/types/patient';
import { loadReports, addReport, loadAlerts, loadFollowUps } from '@/utils/storage';
import { getCurrentUser } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Filter, Calendar, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdvancedReportsProps {
  patients: Patient[];
}

const AdvancedReports: React.FC<AdvancedReportsProps> = ({ patients }) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setReports(loadReports());
  }, []);

  const generateReport = async (type: ReportData['type']) => {
    setIsGenerating(true);
    
    try {
      let reportData: any[] = [];
      let title = '';
      let description = '';

      switch (type) {
        case 'nutritional_status':
          reportData = generateNutritionalStatusReport();
          title = 'Reporte de Estado Nutricional';
          description = 'Listado de pacientes con su último estado nutricional';
          break;
        
        case 'alerts':
          reportData = generateAlertsReport();
          title = 'Reporte de Alertas Nutricionales';
          description = 'Casos con alerta roja/amarilla y su estado de seguimiento';
          break;
        
        case 'followup':
          reportData = generateFollowUpReport();
          title = 'Reporte de Seguimiento Clínico';
          description = 'Evolución de estados por período y seguimientos';
          break;
        
        case 'evolution':
          reportData = generateEvolutionReport();
          title = 'Reporte de Evolución Nutricional';
          description = 'Evolución de estados nutricionales por período';
          break;
      }

      const report: ReportData = {
        id: crypto.randomUUID(),
        type,
        title,
        description,
        filters,
        data: reportData,
        generatedAt: new Date().toISOString(),
        generatedBy: getCurrentUser()?.id || ''
      };

      addReport(report);
      setReports(loadReports());
      setGeneratedReport(reportData);
      
      toast({
        title: "Reporte generado",
        description: `${title} generado exitosamente`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar el reporte",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNutritionalStatusReport = () => {
    return patients.map(patient => {
      const latestRecord = patient.medicalHistory?.[patient.medicalHistory.length - 1];
      return {
        paciente: patient.fullName,
        cedula: patient.cedula,
        edad: patient.age,
        genero: patient.gender === 'male' ? 'Masculino' : 'Femenino',
        ultimoRegistro: latestRecord ? format(new Date(latestRecord.measurementDate), 'dd/MM/yyyy') : 'N/A',
        peso: latestRecord?.weight || 'N/A',
        talla: latestRecord?.height || 'N/A',
        imc: latestRecord?.bmi?.toFixed(2) || 'N/A',
        estadoNutricional: latestRecord?.nutritionalStatus || 'N/A',
        percentil: latestRecord?.percentile || 'N/A',
        profesional: latestRecord?.professionalName || 'N/A'
      };
    });
  };

  const generateAlertsReport = () => {
    const alerts = loadAlerts();
    const followUps = loadFollowUps();
    
    return alerts.map(alert => {
      const patient = patients.find(p => p.id === alert.patientId);
      const followUp = followUps.find(f => f.alertId === alert.id);
      
      return {
        paciente: patient?.fullName || 'N/A',
        cedula: patient?.cedula || 'N/A',
        alerta: alert.title,
        nivel: alert.level,
        estado: alert.status,
        mensaje: alert.message,
        recomendacion: alert.recommendation,
        fechaAlerta: format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm'),
        seguimiento: followUp ? 'Programado' : 'Sin seguimiento',
        fechaSeguimiento: followUp ? format(new Date(followUp.scheduledDate), 'dd/MM/yyyy') : 'N/A',
        estadoSeguimiento: followUp?.status || 'N/A',
        resuelto: alert.isResolved ? 'Sí' : 'No'
      };
    });
  };

  const generateFollowUpReport = () => {
    const followUps = loadFollowUps();
    
    return followUps.map(followUp => {
      const patient = patients.find(p => p.id === followUp.patientId);
      const alert = loadAlerts().find(a => a.id === followUp.alertId);
      
      return {
        paciente: patient?.fullName || 'N/A',
        cedula: patient?.cedula || 'N/A',
        alerta: alert?.title || 'N/A',
        profesional: followUp.professionalName,
        fechaProgramada: format(new Date(followUp.scheduledDate), 'dd/MM/yyyy'),
        estado: followUp.status,
        notas: followUp.notes || 'N/A',
        fechaCompletado: followUp.completedAt ? format(new Date(followUp.completedAt), 'dd/MM/yyyy') : 'N/A',
        creadoPor: followUp.createdBy
      };
    });
  };

  const generateEvolutionReport = () => {
    const monthlyData: any[] = [];
    const now = new Date();
    
    // Generar datos de los últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toISOString().substring(0, 7);
      
      let redCount = 0;
      let yellowCount = 0;
      let greenCount = 0;
      
      patients.forEach(patient => {
        if (patient.medicalHistory) {
          patient.medicalHistory.forEach(record => {
            const recordMonth = new Date(record.measurementDate).toISOString().substring(0, 7);
            if (recordMonth === monthKey) {
              switch (record.nutritionalStatus) {
                case 'red':
                  redCount++;
                  break;
                case 'yellow':
                  yellowCount++;
                  break;
                case 'green':
                  greenCount++;
                  break;
              }
            }
          });
        }
      });
      
      monthlyData.push({
        mes: format(month, 'MMM yyyy', { locale: es }),
        alertasRojas: redCount,
        alertasAmarillas: yellowCount,
        estadoNormal: greenCount,
        total: redCount + yellowCount + greenCount
      });
    }
    
    return monthlyData;
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data: any[], title: string) => {
    // Implementación básica - en producción usaría una librería como jsPDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <p>Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            <table>
              <thead>
                <tr>
                  ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(row => 
                  `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
                ).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      'N/A': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
    };
    
    const labels = {
      red: 'Crítico',
      yellow: 'Riesgo',
      green: 'Normal',
      'N/A': 'N/A'
    };

    return (
      <Badge className={`${colors[status as keyof typeof colors] || colors['N/A']} border`}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Reportes Avanzados</h1>
              <p className="text-indigo-100">Generación y exportación de reportes nutricionales</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generar Reportes</TabsTrigger>
          <TabsTrigger value="history">Historial de Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generador de Reportes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Generar Nuevo Reporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Reporte</Label>
                  <Select onValueChange={(value: ReportData['type']) => {
                    setGeneratedReport(null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de reporte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nutritional_status">Estado Nutricional</SelectItem>
                      <SelectItem value="alerts">Alertas Nutricionales</SelectItem>
                      <SelectItem value="followup">Seguimiento Clínico</SelectItem>
                      <SelectItem value="evolution">Evolución Nutricional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha Inicio</Label>
                    <Input
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          start: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Fecha Fin</Label>
                    <Input
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          end: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Género</Label>
                  <Select 
                    value={filters.gender || 'all'} 
                    onValueChange={(value) => setFilters({
                      ...filters,
                      gender: value === 'all' ? undefined : value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => generateReport('nutritional_status')}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generando...' : 'Generar Estado Nutricional'}
                  </Button>
                  <Button 
                    onClick={() => generateReport('alerts')}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generando...' : 'Generar Alertas'}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => generateReport('followup')}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generando...' : 'Generar Seguimiento'}
                  </Button>
                  <Button 
                    onClick={() => generateReport('evolution')}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generando...' : 'Generar Evolución'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vista Previa del Reporte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Vista Previa
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedReport ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => exportToCSV(generatedReport, 'reporte')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => exportToPDF(generatedReport, 'Reporte Nutricional')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </Button>
                    </div>
                    
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(generatedReport[0] || {}).map((key) => (
                              <TableHead key={key}>{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {generatedReport.slice(0, 10).map((row: any, index: number) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value: any, cellIndex: number) => (
                                <TableCell key={cellIndex}>
                                  {typeof value === 'string' && (value === 'red' || value === 'yellow' || value === 'green') 
                                    ? getStatusBadge(value)
                                    : value
                                  }
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {generatedReport.length > 10 && (
                      <p className="text-sm text-gray-500 text-center">
                        Mostrando 10 de {generatedReport.length} registros
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Genera un reporte para ver la vista previa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reportes Generados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead>Generado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {report.type === 'nutritional_status' ? 'Estado Nutricional' :
                           report.type === 'alerts' ? 'Alertas' :
                           report.type === 'followup' ? 'Seguimiento' : 'Evolución'}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>{report.data.length}</TableCell>
                      <TableCell>
                        {format(new Date(report.generatedAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setGeneratedReport(report.data);
                            }}
                          >
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => exportToCSV(report.data, report.title)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
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

export default AdvancedReports;
