import express from "express";
import SalonesControlador from "../../controladores/salonesControlador.js";

const router = express.Router();
const salonesControlador = new SalonesControlador();

router.get("/", salonesControlador.buscarTodos);
router.get("/:salon_id", salonesControlador.obtenerSalonPorId);
router.post("/", salonesControlador.crearSalon);
router.put("/:salon_id", salonesControlador.actualizarSalon);
router.delete("/:salon_id", salonesControlador.eliminarSalon);

export { router };
