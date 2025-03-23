import z from 'zod';

const turnosSchema = z.object({
  idCancha: z.number().int().positive(),
  idUsuario: z.number().int().positive(),
  idUsuarioCompartido: z.number().int().positive().optional(),
  fecha: z.date(),
  hora: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
      'Invalid time format, expected HH:MM:SS',
    ),
  estado: z.string().min(1).max(20),
  precio: z.number().int().positive(),
  buscandoRival: z
    .union([
      z.number().int().min(0).max(1),
      z
        .string()
        .transform((val) => Number(val) || 0)
        .pipe(z.number().int().min(0).max(1)),
    ])
    .default(0),
  parrilla: z
    .union([
      z.number().int().min(0).max(1),
      z
        .string()
        .transform((val) => Number(val) || 0)
        .pipe(z.number().int().min(0).max(1)),
    ])
    .default(0),
});

export function validateTurnos(data) {
  return turnosSchema.safeParse(data);
}
