/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Autenticación JWT
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario: { type: string, example: "admin@example.com" }
 *               contrasenia: { type: string, example: "admin123" }
 *     responses:
 *       200: { description: Token JWT generado correctamente }
 *       401: { description: Credenciales inválidas }
 */

import express from 'express';
import AuthController from '../../controladores/authController.js';

import { check } from 'express-validator';
import { validarCampos } from '../../middlewares/validarCampos.js';

const router = express.Router();
const authController = new AuthController();

router.post('/login', 
    [
        check('nombre_usuario', 'El correo electrónico es requerido!').not().isEmpty(),
        check('nombre_usuario', 'Revisar el formato del correo electrónico!').isEmail(),
        check('contrasenia', 'La contrasenia es requerida!').not().isEmpty(),
        validarCampos
    ], 
    authController.login);

export {router};