import express from "express";
import InvitadosControlador from "../../controladores/invitadosControlador.js";

const router = express.Router();
const ctrl = new InvitadosControlador();

// GET público (sin passport, sin autorizarUsuarios)
router.get("/confirmar", (req, res) => ctrl.confirmarAsistencia(req, res));

export { router };
