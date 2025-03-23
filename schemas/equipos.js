import z from 'zod';

const equiposSchema = z.object({
  nombre: z.string().min(3).max(60),
});

export function validateEquipos(data) {
  return equiposSchema.safeParse(data);
}
