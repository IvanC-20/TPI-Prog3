import express from "express";
import { body, validationResult } from "express-validator";
import ReservasControlador from "../../controladores/reservasControlador.js";

const router = express.Router();
const reservasControlador = new ReservasControlador();

const validarReserva = [
  body("fecha_reserva")
    .notEmpty().withMessage("La fecha_reserva es obligatoria")
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Use formato YYYY-MM-DD"),
  body("salon_id")
    .notEmpty().withMessage("salon_id es obligatorio")
    .isInt().withMessage("salon_id debe ser entero"),
  body("usuario_id")
    .notEmpty().withMessage("usuario_id es obligatorio")
    .isInt().withMessage("usuario_id debe ser entero"),
  body("turno_id")
    .notEmpty().withMessage("turno_id es obligatorio")
    .isInt().withMessage("turno_id debe ser entero"),
  body("importe_salon")
    .optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("importe_salon debe ser >= 0"),
  body("importe_total")
    .optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("importe_total debe ser >= 0"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    next();
  },
];

router.get("/", reservasControlador.buscarTodos);
router.get("/:reserva_id", reservasControlador.obtenerReservaPorId);
router.post("/", reservasControlador.crearReserva);
router.put("/:reserva_id", reservasControlador.actualizarReserva);
router.delete("/:reserva_id", reservasControlador.eliminarReserva);

export { router };
