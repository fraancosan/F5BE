import z from 'zod';

const equiposTorneosSchema = z.object({
  idEquipo: z.number().int().positive(),
  idTorneo: z.number().int().positive(),
});

export function validateEquiposTorneos(data) {
  return equiposTorneosSchema.safeParse(data);
}
