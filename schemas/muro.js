import z from 'zod';

const muroSchema = z.object({
  titulo: z.string().min(3).max(255),
  noticia: z.string().min(3),
  fecha: z.date().default(() => new Date()),
  fechaFin: z.date(),
});

const muroPartialSchema = muroSchema
  .pick({
    titulo: true,
    noticia: true,
    fecha: false,
    fechaFin: true,
  })
  .partial();

export function validateMuro(data) {
  return muroSchema.safeParse(data);
}

export function validatePartialMuro(data) {
  return muroPartialSchema.safeParse(data);
}
