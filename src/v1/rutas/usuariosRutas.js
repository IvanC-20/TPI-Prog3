/**
 * @openapi
 * tags:
 *   - name: Usuarios
 *     description: "Gestión de usuarios"
 */

/**
 * @openapi
 * /usuarios:
 *   get:
 *     summary: Lista usuarios (Admin=1 ve todos; Empleado=2 solo clientes).
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Crea un usuario (solo Admin=1).
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Usuario" }
 *     responses:
 *       201: { description: Creado }
 */

/**
 * @openapi
 * /usuarios/{usuario_id}:
 *   get:
 *     summary: Obtiene un usuario por ID.
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 *   put:
 *     summary: Actualiza un usuario (solo Admin=1).
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Usuario" }
 *     responses:
 *       200: { description: Actualizado }
 *   delete:
 *     summary: Elimina un usuario (soft delete) (solo Admin=1).
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Eliminado }
 */

import express from 'express';
import { check } from 'express-validator';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';
import { validarCampos } from '../../middlewares/validarCampos.js';
import UsuariosControlador from '../../controladores/usuariosControlador.js';

const router = express.Router();
const usuariosControlador = new UsuariosControlador();

// Rutas de usuarios
// Roles: 1 = Administrador, 2 = Empleado, 3 = Cliente
// Permisos:
// - GET / (listar usuarios): roles [1, 2]
//      * El rol 1 ve todos los usuarios
//      * El rol 2 solo ve los clientes (tipo_usuario = 3)
// - GET /:usuario_id (ver usuario): roles [1, 2]
//      * El rol 1 puede ver cualquier usuario
//      * El rol 2 solo puede ver si el usuario es cliente
// - POST (crear usuario): rol [1]
// - PUT (editar usuario): rol [1]
// - DELETE (eliminar usuario): rol [1]

router.get(
  '/:usuario_id',
  autorizarUsuarios([1,2]),
  usuariosControlador.obtenerUsuarioPorId
);

router.get(
  '/',
  autorizarUsuarios([1,2]),
  usuariosControlador.buscarTodos
);

router.delete(
  '/:usuario_id',
  autorizarUsuarios([1]),
  usuariosControlador.eliminarUsuario
);

router.post(
  '/',
  autorizarUsuarios([1]),
  [
    check('nombre', 'El nombre es obligatorio')
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage('El nombre debe tener al menos 2 caracteres'),

    check('apellido', 'El apellido es obligatorio')
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage('El apellido debe tener al menos 2 caracteres'),

    check('nombre_usuario', 'El nombre de usuario es obligatorio')
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage('Debe tener al menos 3 caracteres'),

    check('contrasenia', 'La contraseña es obligatoria')
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),

    check('tipo_usuario', 'El tipo de usuario es obligatorio')
      .notEmpty()
      .custom(v => Number.isInteger(Number(v)))
      .withMessage('Debe ser un número entero'),

    validarCampos
  ],
  usuariosControlador.crearUsuario
);

router.put(
  '/:usuario_id',
  autorizarUsuarios([1]),
  [
    check('nombre', 'El nombre es obligatorio')
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage('El nombre debe tener al menos 2 caracteres'),

    check('apellido', 'El apellido es obligatorio')
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage('El apellido debe tener al menos 2 caracteres'),

    check('nombre_usuario', 'El nombre de usuario es obligatorio')
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage('Debe tener al menos 3 caracteres'),

    check('tipo_usuario', 'El tipo de usuario es obligatorio')
      .notEmpty()
      .custom(v => Number.isInteger(Number(v)))
      .withMessage('Debe ser un número entero'),

    // contrasenia en update es opcional pero si viene debe medir >=6
    check('contrasenia')
      .optional({ values: 'falsy' })
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),

    validarCampos
  ],
  usuariosControlador.actualizarUsuario
);

export { router };
