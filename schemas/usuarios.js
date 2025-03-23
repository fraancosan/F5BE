import z from 'zod';

// rol is not editable here, only in DB
const usuariosSchema = z.object({
  dni: z.string().length(8),
  nombre: z.string().max(60),
  mail: z.string().email().max(60),
  telefono: z.string().max(30),
  contraseña: z.string().max(60),
});

export function validateUsuarios(data) {
  return usuariosSchema.safeParse(data);
}

export function validatePartialUsuarios(data) {
  return usuariosSchema.partial().safeParse(data);
}
