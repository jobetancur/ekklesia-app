import { z } from 'zod';

export const payableSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  due_date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date({ required_error: 'La fecha es requerida', invalid_type_error: 'Fecha inválida' })),
  description: z.string().optional(),
  site_id: z.string().uuid('ID de sede inválido'),
});
