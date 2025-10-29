import express from 'express';
import { check } from 'express-validator';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';
import { validarCampos } from '../../middlewares/validarCampos.js';
import UsuariosControlador from '../../controladores/usuariosControlador.js';

const router = express.Router();
const usuariosControlador = new UsuariosControlador();

router.get(
  '/:usuario_id',
  autorizarUsuarios([1,2,3]),
  usuariosControlador.obtenerUsuarioPorId
);

router.get(
  '/',
  autorizarUsuarios([1,2,3]),
  usuariosControlador.buscarTodos
);

router.delete(
  '/:usuario_id',
  autorizarUsuarios([1,3]),
  usuariosControlador.eliminarUsuario
);

router.post(
  '/',
  autorizarUsuarios([1,3]),
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
  autorizarUsuarios([1,3]),
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
