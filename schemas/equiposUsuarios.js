import z from 'zod';

// el atributo capitan se establece en false por defecto
// solo se puede tener un capitan por equipo
// el capitan es el usuario que crea el equipo, por lo tanto se establece en la creacion del equipo
const equiposUsuariosSchema = z.object({
  idEquipo: z.number().int().positive(),
  idUsuario: z.number().int().positive(),
});

export function validateEquiposUsuarios(data) {
  return equiposUsuariosSchema.safeParse(data);
}

export function validatePartialEquiposUsuarios(data) {
  return equiposUsuariosSchema.partial().safeParse(data);
}
