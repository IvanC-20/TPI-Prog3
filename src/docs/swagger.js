import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "API Reservas – TPI-Prog3 – Grupo AP",
    version: "1.0.0",
    description:
      "API REST con JWT. Y Roles (1=Admin, 2=Empleado, 3=Cliente). BREAD de Usuarios, Turnos, Servicios, Salones y Reservas. Envío de de invitaciones por mail.",
  },
  servers: [
    { url: "http://localhost:3000/api/v1", description: "Local" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Usuario: {
        type: "object",
        required: ["nombre", "apellido", "nombre_usuario", "contrasenia", "tipo_usuario", "activo"],
        properties: {
          usuario_id: { type: "integer" },
          nombre: { type: "string" },
          apellido: { type: "string" },
          nombre_usuario: { type: "string", example: "admin@example.com" },
          contrasenia: { type: "string" },
          tipo_usuario: {
            type: "integer",
            example: 3,
            description: "1=Admin, 2=Empleado, 3=Cliente",
          },
          celular: { type: "string" },
          foto: { type: ["string", "null"] },
          activo: { type: "integer", example: 1 },
        },
      },
      Turno: {
        type: "object",
        required: ["orden", "hora_desde", "hora_hasta"],
        properties: {
          turno_id: { type: "integer" },
          orden: { type: "integer" },
          hora_desde: { type: "string", example: "10:00:00" },
          hora_hasta: { type: "string", example: "12:00:00" },
          activo: { type: "integer", example: 1 },
        },
      },
      Servicio: {
        type: "object",
        required: ["descripcion", "importe"],
        properties: {
          servicio_id: { type: "integer" },
          descripcion: { type: "string" },
          importe: { type: "number" },
          activo: { type: "integer", example: 1 },
        },
      },
      Salon: {
        type: "object",
        required: ["titulo", "direccion", "capacidad", "importe"],
        properties: {
          salon_id: { type: "integer" },
          titulo: { type: "string" },
          direccion: { type: "string" },
          latitud: { type: ["number", "null"] },
          longitud: { type: ["number", "null"] },
          capacidad: { type: "integer" },
          importe: { type: "number" },
          activo: { type: "integer", example: 1 },
        },
      },
      ReservaServicio: {
        type: "object",
        required: ["reserva_id", "servicio_id", "importe"],
        properties: {
          reserva_id: { type: "integer", example: 1, description: "FK a reservas.reserva_id" },
          servicio_id: { type: "integer", example: 10, description: "FK a servicios.servicio_id" },
          importe: { type: "number", example: 50000.00, description: "decimal(10,2)" },
        },
      },
      Reserva: {
        type: "object",
        required: [
          "fecha_reserva",
          "salon_id",
          "usuario_id",
          "turno_id",
          "importe_salon",
          "importe_total",
        ],
        properties: {
          reserva_id: { type: "integer" },
          fecha_reserva: { type: "string", example: "2025-12-10" },
          salon_id: { type: "integer" },
          usuario_id: { type: "integer" },
          turno_id: { type: "integer" },
          foto_cumpleaniero: { type: ["string", "null"] },
          tematica: { type: ["string", "null"] },
          importe_salon: { type: "number" },
          importe_total: { type: "number" },
          servicios: {
            type: "array",
            items: { $ref: "#/components/schemas/ReservaServicio" },
          },
          activo: { type: "integer", example: 1 },
        },
      },

      Invitado: {
        type: "object",
        properties: {
          invitado_id: { type: "integer", example: 1 },
          reserva_id:  { type: "integer", example: 42 },
          nombre:      { type: "string",  example: "Invitado Demo" },
          apellido:    { type: ["string","null"], example: "Prueba" },
          email:       { type: ["string","null"], format: "email", example: "demo@ejemplo.com" },
          confirmado:  { type: "boolean", example: false }, // tinyint(1)
          notificado:  { type: "boolean", example: false }, // tinyint(1)
          activo:      { type: "integer", example: 1 },     // tinyint(1) soft delete
          creado:      { type: "string", format: "date-time", example: "2025-11-06T12:34:56Z" },
          modificado:  { type: ["string","null"], format: "date-time", example: "2025-11-06T12:45:10Z" }
        },
        required: ["reserva_id","nombre"]
      }
    },
  },
};

export function buildSwaggerSpec() {
  return swaggerJSDoc({
    definition: swaggerDefinition,
    apis: [
      "./src/v1/rutas/*.js"
    ],
  });
}
