import express from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middlewares/validarCampos.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';
import ServiciosControlador from '../../controladores/serviciosControlador.js';

const serviciosControlador = new ServiciosControlador();
const router = express.Router();

router.get('/:servicio_id', autorizarUsuarios([1,2,3]), serviciosControlador.obtenerServicioPorId);
router.get('/', autorizarUsuarios([1,2,3]), serviciosControlador.buscarTodos);
router.delete('/:servicio_id', autorizarUsuarios([1,3]), serviciosControlador.eliminarServicio);

router.post('/',
    autorizarUsuarios([1,3]),
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
    autorizarUsuarios([1,3]),
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
