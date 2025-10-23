import express from "express";
import { body, validationResult } from "express-validator";
import ServiciosControlador from "../../controladores/serviciosControlador.js";

const router = express.Router();
const serviciosControlador = new ServiciosControlador();

const validarServicio = [
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción es obligatoria")
    .isLength({ min: 3 })
    .withMessage("La descripción debe tener al menos 3 caracteres"),
  body("importe")
    .isFloat({ min: 0 })
    .withMessage("El importe debe ser un número positivo"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

router.get("/", serviciosControlador.buscarTodos);
router.get("/:servicio_id", serviciosControlador.obtenerServicioPorId);
router.post("/", serviciosControlador.crearServicio);
router.put("/:servicio_id", serviciosControlador.actualizarServicio);
router.delete("/:servicio_id", serviciosControlador.eliminarServicio);

export { router };
