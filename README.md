# ReservaLocal Frontend

Aplicación SPA en React que consume la API REST de ReservaLocal, un sistema
de reservas pensado para todo tipo de negocios locales. El sistema es genérico:
cualquier negocio puede definir sus propios servicios. La instancia de ejemplo
está configurada con los servicios de una peluquería.
El usuario puede ver los servicios, crear reservas y confirmarlas, cancelarlas
o eliminarlas, con una barra de búsqueda en vivo y filtros por estado.
Proyecto final del curso de Desarrollo Full Stack (Maestro University / DevCamp).

## Tecnologías

- React (hooks y componentes de función)
- JavaScript ES6+
- Axios (cliente de la API)
- Webpack (plantilla inicial de DevCamp)
- SCSS para los estilos
- Alojado en Netlify con despliegue automático desde GitHub

## Funcionalidades

- Lista de servicios traída en vivo desde la API.
- CRUD completo de reservas desde la interfaz: crear, confirmar, cancelar y eliminar.
- Función autodidacta: barra de búsqueda en vivo que combina un filtro de texto
  (nombre del cliente o fecha) con un filtro por estado de la reserva,
  actualizando los resultados en cada tecla pulsada.
- Diseño responsive apto para móvil mediante media queries de CSS.

## Cómo ejecutarlo en local

1. Clona este repositorio.
2. Instala las dependencias: `npm install`.
3. Arranca el servidor de desarrollo: `npm start`
   (se abre en `http://localhost:3000`).

La URL base de la API se configura en `src/api/index.js`.

## Estructura del proyecto

- `src/api/` - Cliente de la API (instancia de Axios y funciones de endpoints).
- `src/components/` - Piezas de interfaz (lista de servicios, formulario de reserva, tarjeta de reserva, esqueleto de la app).
- `src/pages/` - Pantallas (página de reservas con búsqueda y filtros).
- `src/style/` - Estilos SCSS, incluidas las reglas responsive.