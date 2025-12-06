export class Puesto {
  id: string;
  nombre: string;
  color: string;
  estado: string;  
  
  constructor(nombre: string, color: string) {
    this.id = Math.random().toString(36).substring(2);
    this.nombre = nombre;
    this.color = color;
    this.estado = 'pendiente';  
  }
}