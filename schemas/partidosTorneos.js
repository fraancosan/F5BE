import z from 'zod';

const partidosTorneosSchema = z.object({
  idEquipo1: z.number().int().positive(),
  idEquipo2: z.number().int().positive(),
  idTorneo: z.number().int().positive(),
  resultado: z
    .string()
    .max(30)
    .regex(/^(0|[1-9][0-9]*)-(0|[1-9][0-9]*)$/),
  fecha: z.date(),
});

export function validatePartidosTorneos(data) {
  return partidosTorneosSchema.safeParse(data);
}
