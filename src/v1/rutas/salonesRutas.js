import express from "express";
import { body, validationResult } from "express-validator";
import SalonesControlador from "../../controladores/salonesControlador.js";

const router = express.Router();
const salonesControlador = new SalonesControlador();

const validarSalon = [
  body("titulo")
    .notEmpty()
    .withMessage("El título es obligatorio")
    .isLength({ min: 3 })
    .withMessage("El título debe tener al menos 3 caracteres"),
  body("direccion")
    .notEmpty()
    .withMessage("La dirección es obligatoria"),
  body("capacidad")
    .isInt({ min: 1 })
    .withMessage("La capacidad debe ser un número entero mayor que 0"),
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

router.get("/", salonesControlador.buscarTodos);
router.get("/:salon_id", salonesControlador.obtenerSalonPorId);
router.post("/", salonesControlador.crearSalon);
router.put("/:salon_id", salonesControlador.actualizarSalon);
router.delete("/:salon_id", salonesControlador.eliminarSalon);

export { router };
