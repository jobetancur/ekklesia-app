import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().min(3, 'La descripción es requerida (min 3 caracteres)'),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'El tipo es requerido' }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  category_id: z.string().uuid('Debes seleccionar una categoría'),
  account_id: z.string().uuid('Debes seleccionar una cuenta'),
  site_id: z.string().uuid('ID de sede inválido'),
});
