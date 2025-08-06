import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Patient } from '@/types/patient';
import { calculateBMI, getBMICategory } from '@/utils/bmi';
import { addPatient } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

const patientSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  age: z.coerce.number().min(1, 'La edad debe ser mayor a 0').max(120, 'La edad debe ser menor a 120'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Selecciona un género',
  }),
  weight: z.coerce.number().min(10, 'El peso debe ser mayor a 10 kg').max(500, 'El peso debe ser menor a 500 kg'),
  height: z.coerce.number().min(50, 'La estatura debe ser mayor a 50 cm').max(250, 'La estatura debe ser menor a 250 cm'),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  onPatientAdded: () => void;
}

export default function PatientForm({ onPatientAdded }: PatientFormProps) {
  const { toast } = useToast();
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: '',
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
    },
  });

  const onSubmit = (data: PatientFormData) => {
    const bmi = calculateBMI(data.weight, data.height);
    const bmiCategory = getBMICategory(bmi);
    
    const patient: Patient = {
      id: crypto.randomUUID(),
      fullName: data.fullName,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      bmi,
      bmiCategory,
      registrationDate: new Date().toISOString(),
      history: [{
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        weight: data.weight,
        height: data.height,
        bmi,
        bmiCategory,
      }],
    };

    addPatient(patient);
    onPatientAdded();
    form.reset();
    
    toast({
      title: "Paciente registrado",
      description: `${patient.fullName} ha sido registrado exitosamente con IMC ${bmi}`,
    });
  };

  return (
    <Card className="shadow-medical">
      <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Registro de Paciente
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Complete los datos del paciente para calcular automáticamente su IMC
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez García" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="70.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estatura (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="175" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-primary hover:bg-primary/90 transition-smooth">
              <UserPlus className="mr-2 h-4 w-4" />
              Registrar Paciente
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}