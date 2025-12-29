export class RegistroDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: string; // 'cliente', 'emprendedor', 'organizador'
  telefono?: string;
}
//datos para registrarse