import z from 'zod';

const turnosSchema = z.object({
  fecha: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      'Invalid date format, expected YYYY-MM-DD',
    ),
  hora: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):00:00$/,
      'Invalid time format, expected HH:MM:SS, MM = SS = 00',
    ),
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

const editableSchema = turnosSchema
  .pick({
    fecha: true,
    hora: true,
    estado: true,
    buscandoRival: true,
    parrilla: true,
    idCancha: true,
  })
  .extend({
    idCancha: z.number().int().positive(),
    estado: z.string().min(1).max(20),
    idUsuario: z.number().int().positive(),
    idUsuarioCompartido: z.number().int().positive().optional(),
  });

export function validateTurnos(data) {
  return turnosSchema.safeParse(data);
}

export function validatePartialTurnos(data) {
  return editableSchema.partial().safeParse(data);
}
