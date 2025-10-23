import express from "express";
import { body, validationResult } from "express-validator";
import TurnosControlador from "../../controladores/turnosControlador.js";

const router = express.Router();
const turnosControlador = new TurnosControlador();

const validarTurno = [
  body("orden")
    .isInt({ min: 1 })
    .withMessage("El orden debe ser un número entero mayor que 0"),
  body("hora_desde")
    .notEmpty()
    .withMessage("La hora_desde es obligatoria (HH:MM:SS)"),
  body("hora_hasta")
    .notEmpty()
    .withMessage("La hora_hasta es obligatoria (HH:MM:SS)"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

router.get("/", turnosControlador.buscarTodos);
router.get("/:turno_id", turnosControlador.obtenerTurnoPorId);
router.post("/", turnosControlador.crearTurno);
router.put("/:turno_id", turnosControlador.actualizarTurno);
router.delete("/:turno_id", turnosControlador.eliminarTurno);

export { router };
