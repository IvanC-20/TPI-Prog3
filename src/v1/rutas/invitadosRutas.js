/**
 * @openapi
 * tags:
 *   - name: Invitados
 *     description: Gestión de invitados asociados a reservas
 */

/**
 * @openapi
 * /api/v1/invitados:
 *   get:
 *     summary: Lista todos los invitados (roles 1,2)
 *     tags: [Invitados]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Crea un invitado (roles 1,2)
 *     tags: [Invitados]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reserva_id, nombre]
 *             properties:
 *               reserva_id: { type: integer }
 *               nombre: { type: string }
 *               apellido: { type: string }
 *               email: { type: string, format: email }
 *               confirmado: { type: boolean }
 *               notificado: { type: boolean }
 *     responses:
 *       201: { description: Creado }
 *
 * /api/v1/invitados/{invitado_id}:
 *   get:
 *     summary: Obtiene invitado por ID (roles 1,2,3)
 *     tags: [Invitados]
 *     parameters:
 *       - in: path
 *         name: invitado_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 *   put:
 *     summary: Edita invitado (roles 1,2)
 *     tags: [Invitados]
 *   delete:
 *     summary: Elimina invitado (soft delete) (roles 1,2)
 *     tags: [Invitados]
 */

import express from "express";
import { check } from "express-validator";
import { validarCampos } from "../../middlewares/validarCampos.js";
import autorizarUsuarios from "../../middlewares/autorizarUsuarios.js";
import InvitadosControlador from "../../controladores/invitadosControlador.js";

const router = express.Router();
const invitadosControlador = new InvitadosControlador();

// GET /api/v1/invitados
router.get(
  "/",
  autorizarUsuarios([1, 2, 3]),
  invitadosControlador.listarTodos
);

// POST /api/v1/invitados
router.post(
  "/",
  autorizarUsuarios([1, 2]),
  [
    check("reserva_id", "La reserva_id es obligatoria")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Debe ser un número entero mayor que 0"),
    check("nombre", "El nombre es obligatorio")
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Debe tener al menos 2 caracteres"),
    check("email")
      .optional({ nullable: true })
      .isEmail()
      .withMessage("Formato de email inválido"),
    check("confirmado").optional().isBoolean().withMessage("Debe ser boolean"),
    check("notificado").optional().isBoolean().withMessage("Debe ser boolean"),
    validarCampos,
  ],
  invitadosControlador.crearInvitado
);

// GET /api/v1/invitados/:invitado_id
router.get(
  "/:invitado_id",
  autorizarUsuarios([1, 2, 3]),
  invitadosControlador.obtenerInvitadoPorId
);

// PUT /api/v1/invitados/:invitado_id
router.put(
  "/:invitado_id",
  autorizarUsuarios([1, 2]),
  [
    check("nombre")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Debe tener al menos 2 caracteres"),
    check("email")
      .optional({ nullable: true })
      .isEmail()
      .withMessage("Formato de email inválido"),
    check("confirmado").optional().isBoolean(),
    check("notificado").optional().isBoolean(),
    validarCampos,
  ],
  invitadosControlador.actualizarInvitado
);

// DELETE /api/v1/invitados/:invitado_id
router.delete(
  "/:invitado_id",
  autorizarUsuarios([1, 2]),
  invitadosControlador.eliminarInvitado
);

export { router };
