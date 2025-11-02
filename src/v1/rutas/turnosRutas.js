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
