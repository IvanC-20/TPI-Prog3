/**
 * @openapi
 * tags:
 *   - name: Reservas
 *     description: "Gestión de reservas"
 */

/**
 * @openapi
 * /reservas:
 *   get:
 *     summary: Lista todas las reservas (1,2,3).
 *     description: "Admin (1) y Empleado (2) pueden ver todas."
 *     tags: [Reservas]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Crea una reserva (solo 1,3).
 *     description: "Solo Admin (1) y Cliente (3) pueden crear (excluido Empleado)."
 *     tags: [Reservas]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fecha_reserva, salon_id, usuario_id, turno_id, importe_salon, importe_total, servicios]
 *             properties:
 *               fecha_reserva: { type: string, example: "2025-11-20" }
 *               salon_id:      { type: integer, example: 3 }
 *               usuario_id:    { type: integer, example: 16 }
 *               turno_id:      { type: integer, example: 2 }
 *               foto_cumpleaniero: { type: ["string","null"], example: null }
 *               tematica:      { type: ["string","null"], example: "Aventura espacial" }
 *               importe_salon: { type: number, example: 160000 }
 *               importe_total: { type: number, example: 210000 }
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [servicio_id, importe]
 *                   properties:
 *                     servicio_id: { type: integer, example: 10 }
 *                     importe:     { type: number, example: 50000 }
 *     responses:
 *       201:
 *         description: Creado
 *
 * /reservas/{reserva_id}:
 *   get:
 *     summary: Obtiene una reserva por ID (1,2,3).
 *     description: "Admin (1) y Empleado (2) pueden ver todas; Cliente (3) solo las suyas."
 *     tags: [Reservas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *   put:
 *     summary: Actualiza una reserva (solo 1).
 *     description: "Solo Admin (1) puede modificar."
 *     tags: [Reservas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva: { type: string, example: "2025-11-22" }
 *               salon_id:      { type: integer, example: 4 }
 *               usuario_id:    { type: integer, example: 7 }
 *               turno_id:      { type: integer, example: 2 }
 *               foto_cumpleaniero: { type: ["string","null"], example: null }
 *               tematica:      { type: ["string","null"], example: "Aventura espacial (actualizada)" }
 *               importe_salon: { type: number, example: 165000 }
 *               importe_total: { type: number, example: 220000 }
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     servicio_id: { type: integer, example: 11 }
 *                     importe:     { type: number, example: 10000 }
 *     responses:
 *       200:
 *         description: Actualizado
 *   delete:
 *     summary: Elimina (soft delete) una reserva (solo 1).
 *     description: "Solo Admin (1) puede eliminar."
 *     tags: [Reservas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Eliminado
 */

import express from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middlewares/validarCampos.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';
import ReservasControlador from '../../controladores/reservasControlador.js';

// Rutas de reservas
// Roles: 1 = Administrador, 2 = Empleado, 3 = Cliente
// Permisos:
// - GET (listar o ver reserva): roles [1, 2, 3]
// - POST (crear reserva): roles [1, 3]
// - PUT (editar reserva): solo rol [1]
// - DELETE (eliminar reserva): solo rol [1]

const reservasControlador = new ReservasControlador();
const router = express.Router();

router.get('/informe',autorizarUsuarios([1]), reservasControlador.informeIngresos);  
router.get('/:reserva_id',  autorizarUsuarios([1,2,3]), reservasControlador.obtenerReservaPorId);
router.get('/',  autorizarUsuarios([1,2,3]), reservasControlador.buscarTodos);
router.delete("/:reserva_id", autorizarUsuarios([1]), reservasControlador.eliminarReserva);
router.post('/', autorizarUsuarios([1, 3]),
    [
        check('fecha_reserva', 'La fecha es necesaria.').notEmpty(),
        check('salon_id', 'El salón es necesario.').notEmpty(),
        check('usuario_id', 'El usuario es necesario.').notEmpty(), 
        check('turno_id', 'El turno es necesario.').notEmpty(),  
        check('servicios', 'Faltan los servicios de la reserva.')
        .notEmpty()
        .isArray(),
        check('servicios.*.importe')
        .isFloat() 
        .withMessage('El importe debe ser numérico.'),   
        validarCampos
    ],
    reservasControlador.crearReserva);

router.put('/:reserva_id', autorizarUsuarios([1]),
    [
        check('fecha_reserva', 'La fecha es necesaria.').notEmpty(),
        check('salon_id', 'El salón es necesario.').notEmpty(),
        check('usuario_id', 'El usuario es necesario.').notEmpty(), 
        check('turno_id', 'El turno es necesario.').notEmpty(),  
        check('servicios', 'Faltan los servicios de la reserva.')
        .notEmpty()
        .isArray(),
        check('servicios.*.importe')
        .isFloat() 
        .withMessage('El importe debe ser numérico.'),   
        validarCampos
    ],
    reservasControlador.actualizarReserva);

export { router };