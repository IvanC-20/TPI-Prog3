/**
 * @openapi
 * tags:
 *   - name: Turnos
 *     description: Gestión de turnos
 */

/**
 * @openapi
 * /turnos:
 *   get:
 *     summary: Lista turnos (1,2,3).
 *     tags: [Turnos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Crea turno (solo 1,2).
 *     tags: [Turnos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Turno" }
 *     responses:
 *       201: { description: Creado }
 */

/**
 * @openapi
 * /turnos/{turno_id}:
 *   get:
 *     summary: Obtiene turno por ID (1,2,3).
 *     tags: [Turnos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: turno_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 *   put:
 *     summary: Edita turno (solo 1,2).
 *     tags: [Turnos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: turno_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Turno" }
 *     responses:
 *       200: { description: Actualizado }
 *   delete:
 *     summary: Borra turno (soft delete) (solo 1,2).
 *     tags: [Turnos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: turno_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Eliminado }
 */

import express from 'express';
import { check } from 'express-validator';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';
import { validarCampos } from '../../middlewares/validarCampos.js';
import TurnosControlador from '../../controladores/turnosControlador.js';

const router = express.Router();
const turnosControlador = new TurnosControlador();

// Rutas de turnos
// Roles: 1 = Administrador, 2 = Empleado, 3 = Cliente
// Permisos:
// - GET (listar o ver turno): roles [1, 2, 3]
// - POST (crear turno): roles [1, 2]
// - PUT (editar turno): roles [1, 2]
// - DELETE (eliminar turno): roles [1, 2]

router.get('/:turno_id',
  autorizarUsuarios([1,2,3]),
  turnosControlador.obtenerTurnoPorId
);

router.get('/',
  autorizarUsuarios([1,2,3]),
  turnosControlador.buscarTodos
);

router.delete('/:turno_id',
  autorizarUsuarios([1,2]),
  turnosControlador.eliminarTurno
);

router.post('/',
  autorizarUsuarios([1,2]),
  [
    check('orden', 'El orden es obligatorio y debe ser un entero > 0')
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage('El orden debe ser un número entero mayor que 0'),
    check('hora_desde', 'La hora_desde es obligatoria (HH:MM:SS)')
      .notEmpty(),
    check('hora_hasta', 'La hora_hasta es obligatoria (HH:MM:SS)')
      .notEmpty(),
    validarCampos
  ],
  turnosControlador.crearTurno
);

router.put('/:turno_id',
  autorizarUsuarios([1,2]),
  [
    check('orden', 'El orden es obligatorio y debe ser un entero > 0')
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage('El orden debe ser un número entero mayor que 0'),
    check('hora_desde', 'La hora_desde es obligatoria (HH:MM:SS)')
      .notEmpty(),
    check('hora_hasta', 'La hora_hasta es obligatoria (HH:MM:SS)')
      .notEmpty(),
    validarCampos
  ],
  turnosControlador.actualizarTurno
);

export { router };
