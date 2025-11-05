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
 *             $ref: "#/components/schemas/Reserva"
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Reserva"
 *     responses:
 *       200:
 *         description: Actualizado
 *   delete:
 *     summary: Elimina (soft delete) una reserva (solo 1).
 *     description: "Solo Admin (1) puede eliminar."
 *     tags: [Reservas]
 *     security: [{ bearerAuth: [] }]
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