import z from 'zod';

const equiposUsuariosSchema = z.object({
  idEquipo: z.number().int().positive(),
  idUsuario: z.number().int().positive(),
  capitan: z
    .union([
      z.number().int().min(0).max(1),
      z
        .string()
        .transform((val) => Number(val) || 0)
        .pipe(z.number().int().min(0).max(1)),
    ])
    .default(0),
});

export function validateEquiposUsuarios(data) {
  return equiposUsuariosSchema.safeParse(data);
}
