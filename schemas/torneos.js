import z from 'zod';

const torneosSchema = z.object({
  descripcion: z.string().max(255),
  fechaInicio: z.date(),
  fechaFin: z.date(),
  precioInscripcion: z.number().int().positive(),
  cantidadEquipos: z.number().int().positive(),
});

export function validateTorneos(data) {
  return torneosSchema.safeParse(data);
}

export function validatePartialTorneos(data) {
  return torneosSchema.partial().safeParse(data);
}
