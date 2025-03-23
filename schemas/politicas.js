import z from 'zod';

const politicasSchema = z.object({
  nombre: z.string().min(3).max(50),
  descripcion: z.string().min(3).max(50),
});

export function validatePoliticas(data) {
  return politicasSchema.safeParse(data);
}
