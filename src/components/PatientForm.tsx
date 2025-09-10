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
  cedula: z.string().min(10, 'La cédula debe tener al menos 10 caracteres'),
  age: z.coerce.number().min(1, 'La edad debe ser mayor a 0').max(120, 'La edad debe ser menor a 120'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Selecciona un género',
  }),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  emergencyContact: z.string().min(2, 'El contacto de emergencia es requerido'),
  emergencyPhone: z.string().min(10, 'El teléfono de emergencia debe tener al menos 10 caracteres'),
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
      cedula: '',
      age: undefined,
      gender: undefined,
      birthDate: '',
      phone: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
    },
  });

  const onSubmit = (data: PatientFormData) => {
    const patient: Patient = {
      id: crypto.randomUUID(),
      fullName: data.fullName,
      cedula: data.cedula,
      age: data.age,
      gender: data.gender,
      birthDate: data.birthDate,
      phone: data.phone,
      address: data.address,
      emergencyContact: data.emergencyContact,
      emergencyPhone: data.emergencyPhone,
      registrationDate: new Date().toISOString(),
      medicalHistory: [],
    };

    addPatient(patient);
    onPatientAdded();
    form.reset();
    
    toast({
      title: "Paciente registrado",
      description: `${patient.fullName} ha sido registrado exitosamente`,
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
          Complete los datos del paciente para el registro en el sistema
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
                name="cedula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cédula</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="0987654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle Principal 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto de emergencia</FormLabel>
                    <FormControl>
                      <Input placeholder="María García (Madre)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de emergencia</FormLabel>
                    <FormControl>
                      <Input placeholder="0987654321" {...field} />
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