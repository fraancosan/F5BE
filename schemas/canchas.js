import z from 'zod';

const canchasSchema = z.object({
  disponible: z
    .union([
      z.number().int().min(0).max(1),
      z
        .string()
        .transform((val) => Number(val) || 0)
        .pipe(z.number().int().min(0).max(1)),
    ])
    .default(0),
});

export function validateCanchas(data) {
  return canchasSchema.safeParse(data);
}
