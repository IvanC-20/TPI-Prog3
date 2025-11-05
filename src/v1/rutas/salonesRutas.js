/**
 * @openapi
 * tags:
 *   - name: Salones
 *     description: Gestión de salones
 */

/**
 * @openapi
 * /salones:
 *   get:
 *     summary: Lista salones (1,2,3).
 *     tags: [Salones]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Crea salón (solo 1,2).
 *     tags: [Salones]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Salon" }
 *     responses:
 *       201: { description: Creado }
 */

/**
 * @openapi
 * /salones/{salon_id}:
 *   get:
 *     summary: Obtiene salón por ID (1,2,3).
 *     tags: [Salones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: salon_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 *   put:
 *     summary: Edita salón (solo 1,2).
 *     tags: [Salones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: salon_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Salon" }
 *     responses:
 *       200: { description: Actualizado }
 *   delete:
 *     summary: Borra salón (soft delete) (solo 1,2).
 *     tags: [Salones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: salon_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Eliminado }
 */

import express from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middlewares/validarCampos.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';
import SalonesControlador from '../../controladores/salonesControlador.js';

const salonesControlador = new SalonesControlador();
const router = express.Router();

// Rutas de salones
// Roles: 1 = Administrador, 2 = Empleado, 3 = Cliente
// Permisos:
// - GET (listar o ver salón): roles [1, 2, 3]
// - POST (crear salón): roles [1, 2]
// - PUT (editar salón): roles [1, 2]
// - DELETE (eliminar salón): roles [1, 2]

router.get('/:salon_id', autorizarUsuarios([1,2,3]), salonesControlador.obtenerSalonPorId);
router.get('/', autorizarUsuarios([1,2,3]), salonesControlador.buscarTodos);
router.delete('/:salon_id', autorizarUsuarios([1,2]), salonesControlador.eliminarSalon);

router.post('/',
    autorizarUsuarios([1,2]),
    [
        check('titulo', 'El título es obligatorio').notEmpty().isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres'),
        check('direccion', 'La dirección es obligatoria').notEmpty(),
        check('capacidad', 'La capacidad es obligatoria')
            .notEmpty()
            .isInt({ min: 1 })
            .withMessage('La capacidad debe ser un número entero mayor que 0'),
        check('importe', 'El importe es obligatorio')
            .notEmpty()
            .isFloat({ min: 0 })
            .withMessage('El importe debe ser un número positivo'),
        validarCampos
    ],
    salonesControlador.crearSalon
);

router.put('/:salon_id',
    autorizarUsuarios([1,2]),
    [
        check('titulo', 'El título es obligatorio').notEmpty().isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres'),
        check('direccion', 'La dirección es obligatoria').notEmpty(),
        check('capacidad', 'La capacidad es obligatoria')
            .notEmpty()
            .isInt({ min: 1 })
            .withMessage('La capacidad debe ser un número entero mayor que 0'),
        check('importe', 'El importe es obligatorio')
            .notEmpty()
            .isFloat({ min: 0 })
            .withMessage('El importe debe ser un número positivo'),
        validarCampos
    ],
    salonesControlador.actualizarSalon
);

export { router };
