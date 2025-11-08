/**
 * @openapi
 * tags:
 *   - name: Servicios
 *     description: Gestión de servicios
 */

/**
 * @openapi
 * /servicios:
 *   get:
 *     summary: Lista servicios (1,2,3).
 *     tags: [Servicios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Crea servicio (solo 1,2).
 *     tags: [Servicios]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [descripcion, importe]
 *             properties:
 *               descripcion: { type: string, example: "Animación y juegos cooperativos" }
 *               importe:     { type: number, example: 35000 }
 *     responses:
 *       201: { description: Creado }
 */

/**
 * @openapi
 * /servicios/{servicio_id}:
 *   get:
 *     summary: Obtiene servicio por ID (1,2,3).
 *     tags: [Servicios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: servicio_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 *   put:
 *     summary: Edita servicio (solo 1,2).
 *     tags: [Servicios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: servicio_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion: { type: string, example: "Animación (actualizada) + búsqueda del tesoro" }
 *               importe:     { type: number, example: 42000 }
 *     responses:
 *       200: { description: Actualizado }
 *   delete:
 *     summary: Borra servicio (soft delete) (solo 1,2).
 *     tags: [Servicios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: servicio_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Eliminado }
 */

import express from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middlewares/validarCampos.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';
import ServiciosControlador from '../../controladores/serviciosControlador.js';

const serviciosControlador = new ServiciosControlador();
const router = express.Router();

// Rutas de servicios
// Roles: 1 = Administrador, 2 = Empleado, 3 = Cliente
// Permisos:
// - GET (listar o ver servicio): roles [1, 2, 3]
// - POST (crear servicio): roles [1, 2]
// - PUT (editar servicio): roles [1, 2]
// - DELETE (eliminar servicio): roles [1, 2]

router.get('/:servicio_id', autorizarUsuarios([1,2,3]), serviciosControlador.obtenerServicioPorId);
router.get('/', autorizarUsuarios([1,2,3]), serviciosControlador.buscarTodos);
router.delete('/:servicio_id', autorizarUsuarios([1,2]), serviciosControlador.eliminarServicio);

router.post('/',
    autorizarUsuarios([1,2]),
    [
        check('descripcion', 'La descripción es obligatoria')
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage('La descripción debe tener al menos 3 caracteres'),
        check('importe', 'El importe es obligatorio')
            .notEmpty()
            .isFloat({ min: 0 })
            .withMessage('El importe debe ser un número positivo'),
        validarCampos
    ],
    serviciosControlador.crearServicio
);

router.put('/:servicio_id',
    autorizarUsuarios([1,2]),
    [
        check('descripcion', 'La descripción es obligatoria')
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage('La descripción debe tener al menos 3 caracteres'),
        check('importe', 'El importe es obligatorio')
            .notEmpty()
            .isFloat({ min: 0 })
            .withMessage('El importe debe ser un número positivo'),
        validarCampos
    ],
    serviciosControlador.actualizarServicio
);

export { router };
