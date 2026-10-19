# ReservaLocal

Plataforma web de reservas para negocios locales (peluquerías, barberías, consultas...).
Los negocios publican sus servicios y su horario semanal. Los clientes reservan cita online.


---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend (API) | Python + Flask + SQLAlchemy |
| Base de datos | MySQL/TiDB (local) · SQLite (servidor) |
| Frontend | React (SPA) + SCSS |
| Despliegue backend | PythonAnywhere |
| Despliegue frontend | Netlify |

---

## Funcionalidades

### Cuentas y roles
- Registro con **nombre y apellidos** obligatorios.
- Dos roles: **cliente** y **admin**.
- Para crear un negocio al registrarse hay que usar un **código de administrador**.
  - Código maestro: `1234`
- Validación cruzada: si escribes nombre de negocio sin código (o código sin nombre), el registro se bloquea con un mensaje claro.
- Sesión por token (Bearer) guardado en el navegador.

### Negocios (multi-negocio)
- Cada admin es dueño de su propio negocio y solo ve/gestiona el suyo.
- El Admin puede añadir y restar servicios asignandole el precio que considere justo.
- Tambien podrá editarlos y cambiar sus caracteristicas.
- **Icono único** por negocio: el admin sube una imagen (png/jpg/gif/webp, máx. 5 MB) que aparece en la navbar y en el selector.
- El cliente elige a qué negocio ir desde un **selector de tarjetas**.
- El admin tambien podrá editar el nombre de su negocio cuando le plazca.

### Horarios
- **Horario semanal**: el admin configura cada uno de los 7 días (abierto/cerrado, hora de apertura, hora de cierre e intervalo de citas en minutos).
- Los slots disponibles se generan dinámicamente según ese horario.
- **Validación de pasado**: no se puede reservar en días u horas que ya pasaron (comprobado en el backend contra la hora del servidor).
- Si el negocio está cerrado ese día, o el día ya pasó, el cliente recibe un mensaje claro.
- Si el cliente necesita mas de un solo servicio debera añadir otra reserva mas para poder reservar otra franja de tiempo a su disposición.
- El cliente no podrá reservar una cita a partir de un mes desde el dia actual.

### Reservas
- El cliente reserva eligiendo **servicio + día + hora disponible** (el nombre del cliente se toma automáticamente de su cuenta).
- Tras reservar, el cliente vuelve al menú de negocios con un mensaje de confirmación (evita reservas masivas accidentales).
- "Mis reservas": el cliente ve todas sus citas de todos los negocios, y puede **cambiar la hora**, **cancelar** o **eliminar** despues de cancelarla.
- El admin ve la agenda completa de su negocio y puede **confirmar**, **cancelar** o **eliminar** cualquier reserva.
- Un mismo slot no puede reservarse dos veces para que un cliente no pueda abusar de la toma de reservas (conflicto → error 409).
- Buscador con filtros por texto y por estado (solo lo tiene el admin).

### Interfaz
- Tema **oscuro** con acentos en azul cielo.
- Iconos SVG propios (sin librerías externas).
- Botón "ojo" para mostrar/ocultar la contraseña.
- Notificaciones *toast* que desaparecen solas.
- Diseño responsive (móvil y escritorio).

---

## Cuentas de prueba

| Rol | Email | Contraseña | Negocio |
|---|---|---|---|
| Admin | `admin@reservalocal.com` | `Admin123.` | Peluquería Jon |
| Admin | `admin2@reservalocal.com` | `Admin123.` | Barbería Central |
| Cliente | `cliente@reservalocal.com` | `Cliente123!` | — |

Código maestro para crear negocios nuevos: **`1234`**

---