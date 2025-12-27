export class CreateUsuarioDto {
  email: string;     
  password: string;  
  nombre: string;    
  apellido: string;  
  telefono?: string; // Teléfono (opcional)
  rol: string;       // Rol: 'cliente', 'emprendedor', 'organizador'
}

//datos necesarios para crear un nuevo usuario