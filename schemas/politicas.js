import z from 'zod';

const politicasSchema = z.object({
  nombre: z.string().min(3).max(50),
  descripcion: z.string().min(3).max(50),
});

const politicasUpdateSchema = politicasSchema.pick({
  nombre: false,
  descripcion: true,
});

export function validatePoliticas(data) {
  return politicasSchema.safeParse(data);
}

export function validatePoliticasUpdate(data) {
  return politicasUpdateSchema.safeParse(data);
}
