import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Patient } from '@/types/patient';
import { getBMICategoryInfo, formatBMI } from '@/utils/bmi';
import { FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PDFExportProps {
  patients: Patient[];
  title: string;
  isGeneralReport?: boolean;
}

export default function PDFExport({ patients, title, isGeneralReport = false }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    if (patients.length === 0) {
      toast({
        title: "Error",
        description: "No hay pacientes para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      
      // Header
      pdf.setFillColor(33, 150, 243);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sistema de Gestión de Pacientes', margin, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Fecha: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, margin, 35);

      // Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, 60);

      let yPosition = 80;

      if (isGeneralReport) {
        // General Report
        const totalPatients = patients.length;
        const averageAge = totalPatients > 0 ? patients.reduce((sum, p) => sum + p.age, 0) / totalPatients : 0;
        const averageBMI = totalPatients > 0 ? patients.reduce((sum, p) => sum + p.bmi, 0) / totalPatients : 0;

        // Statistics
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Estadísticas Generales', margin, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Total de pacientes: ${totalPatients}`, margin, yPosition);
        yPosition += 8;
        pdf.text(`Edad promedio: ${averageAge.toFixed(1)} años`, margin, yPosition);
        yPosition += 8;
        pdf.text(`IMC promedio: ${averageBMI.toFixed(1)} kg/m²`, margin, yPosition);
        yPosition += 20;

        // BMI Distribution
        const bmiDistribution = {
          underweight: patients.filter(p => p.bmiCategory === 'underweight').length,
          normal: patients.filter(p => p.bmiCategory === 'normal').length,
          overweight: patients.filter(p => p.bmiCategory === 'overweight').length,
          obesity: patients.filter(p => p.bmiCategory === 'obesity').length,
        };

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Distribución por Categoría de IMC', margin, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        Object.entries(bmiDistribution).forEach(([category, count]) => {
          const percentage = totalPatients > 0 ? (count / totalPatients * 100).toFixed(1) : '0';
          const categoryInfo = getBMICategoryInfo(category as any);
          pdf.text(`${categoryInfo.label}: ${count} pacientes (${percentage}%)`, margin, yPosition);
          yPosition += 8;
        });

        yPosition += 10;
      }

      // Patient Table Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(isGeneralReport ? 'Lista de Pacientes' : 'Información del Paciente', margin, yPosition);
      yPosition += 15;

      // Table
      const tableHeaders = ['Nombre', 'Edad', 'Género', 'Peso', 'Estatura', 'IMC', 'Categoría'];
      const colWidths = [45, 20, 25, 20, 25, 25, 30];
      
      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 5, contentWidth, 10, 'F');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      let xPosition = margin;
      
      tableHeaders.forEach((header, index) => {
        pdf.text(header, xPosition + 2, yPosition);
        xPosition += colWidths[index];
      });
      
      yPosition += 10;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      
      patients.forEach((patient, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 40;
        }

        xPosition = margin;
        const rowData = [
          patient.fullName.length > 25 ? patient.fullName.substring(0, 22) + '...' : patient.fullName,
          `${patient.age}`,
          patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O',
          `${patient.weight}kg`,
          `${patient.height}cm`,
          formatBMI(patient.bmi),
          getBMICategoryInfo(patient.bmiCategory).label.substring(0, 12)
        ];

        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
        }

        rowData.forEach((data, colIndex) => {
          pdf.text(data, xPosition + 2, yPosition);
          xPosition += colWidths[colIndex];
        });

        yPosition += 8;
      });

      // Individual patient details (for single patient reports)
      if (!isGeneralReport && patients.length === 1) {
        const patient = patients[0];
        yPosition += 20;

        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Información Detallada', margin, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const details = [
          `Fecha de registro: ${format(new Date(patient.registrationDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}`,
          `IMC: ${formatBMI(patient.bmi)} - ${getBMICategoryInfo(patient.bmiCategory).label}`,
          `Clasificación: ${getBMICategoryInfo(patient.bmiCategory).label}`,
        ];

        details.forEach(detail => {
          pdf.text(detail, margin, yPosition);
          yPosition += 8;
        });

        // History
        if (patient.history && patient.history.length > 1) {
          yPosition += 10;
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Historial de Registros', margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          
          patient.history.forEach((record, index) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 40;
            }
            
            const recordDate = format(new Date(record.date), 'dd/MM/yyyy', { locale: es });
            pdf.text(`${index + 1}. ${recordDate} - Peso: ${record.weight}kg, IMC: ${formatBMI(record.bmi)}`, margin, yPosition);
            yPosition += 6;
          });
        }
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        pdf.text('Sistema de Gestión de Pacientes - Reporte Médico', margin, pageHeight - 10);
      }

      // Save PDF
      const filename = isGeneralReport 
        ? `reporte_general_${format(new Date(), 'yyyy-MM-dd')}.pdf`
        : `reporte_${patients[0].fullName.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      pdf.save(filename);

      toast({
        title: "PDF generado",
        description: `El reporte se ha descargado como ${filename}`,
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar el PDF",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating || patients.length === 0}
      className="bg-gradient-primary hover:bg-primary/90 transition-smooth"
    >
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      {isGenerating ? 'Generando...' : 'Exportar PDF'}
    </Button>
  );
}