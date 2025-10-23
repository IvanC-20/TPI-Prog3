import express from "express";
import { body, validationResult } from "express-validator";
import UsuariosControlador from "../../controladores/usuariosControlador.js";

const router = express.Router();
const usuariosControlador = new UsuariosControlador();

const validarUsuario = [
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres"),

  body("apellido")
    .notEmpty().withMessage("El apellido es obligatorio")
    .isLength({ min: 2 }).withMessage("El apellido debe tener al menos 2 caracteres"),

  body("nombre_usuario")
    .notEmpty().withMessage("El nombre de usuario es obligatorio")
    .isLength({ min: 3 }).withMessage("Debe tener al menos 3 caracteres"),

  body("contrasenia")
    .optional({ values: "falsy" })
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("tipo_usuario")
    .notEmpty().withMessage("El tipo de usuario es obligatorio")
    .custom((v) => Number.isInteger(Number(v))).withMessage("Debe ser un número entero"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    next();
  },
];

router.get("/", usuariosControlador.buscarTodos);
router.get("/:usuario_id", usuariosControlador.obtenerUsuarioPorId);
router.post("/", usuariosControlador.crearUsuario);
router.put("/:usuario_id", usuariosControlador.actualizarUsuario);
router.delete("/:usuario_id", usuariosControlador.eliminarUsuario);

export { router };
