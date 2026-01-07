Primero debemos usar el comando "npm" run dev para activar el programa y por ende levantar el servidor, si sale la siguiente imagen en la terminal vamos por buen camino:
![alt text](<src/img/Captura de pantalla 2026-01-07 010716.png>)

Despues de eso vamos a postman a comprobar que todo arranque, debe salirno algo asi: 
![alt text](<src/img/Captura de pantalla 2026-01-07 010937.png>)

Ya de base tiene 3 usuarios con los 3 rangos nesecesarios para trabajar, puede ser inspeccionado con GET http://localhost:3000/api, si quisieramos crear uno nuevo solo debemos colocar algo asi en el body: 
{
    "email": "correo@cualquiercosa.com",
    "password": "contrasena",
    "nombre": "nombre cualquiera",
    "apellido": "apellido cualquiera",
    "telefono": "1234567890", //esta parte recordarla ya que se incripta
    "rol": "organizador o cliente o emprendedor"
}
debemos usar el endpoint POST http://localhost:3000/api/usuarios y enviarlo, deberia salir algo asi:
![alt text](<src/img/Captura de pantalla 2026-01-07 011415.png>)

Aprovechando que somos un emprendedor creemos un puesto, para eso nesecitamos logearnos para conseguir un token. utilizando http://localhost:3000/api/usuarios/login y recordando la contrasena que le dimos nos daria el token:
![alt text](<src/img/Captura de pantalla 2026-01-07 011708.png>)

usan el token-1767763023132-trsp9f2uon en autorizacion, lo pegan  cuando usen el endpoint http://localhost:3000/api/puestos,  le colocamos nombre y color junto nuestro ID de usuario emprendedor:  
![alt text](<src/img/Captura de pantalla 2026-01-07 011952.png>)

ahora por ultimo tenemos que aprobar y activar el negocio, para eso nesecitamos el token de un organizador, como se menciono de base ya tenemos un organizador, por lo que usando su password: admin123 y su email: admin@feria.com obtenemos su token-1767763364041-62u0p8mfgge. Vamos a PATCH http://localhost:3000/api/puestos/:id/estado (el id es del puesto) y colocamos el token, despues esto en el body: 
{
  "estado": "aprobado"
}

y con eso enviamos y deberia darnos esto
![alt text](<src/img/Captura de pantalla 2026-01-07 012631.png>)

cambiamos el estado por activo y estaria listo para trabajar el puesto: 
![alt text](<src/img/Captura de pantalla 2026-01-07 012749.png>)

ahora si quisieramos borrar el puesto debe ser cuando esta en estado de pendiente ya que en aprobado, activado y inactivo (si llegas al estado inactivo puedes devolverlo a activo) no se puede
