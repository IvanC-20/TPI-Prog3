// src/reservas.js
import express from 'express';
import passport from 'passport';
import morgan from 'morgan';
import fs from 'fs';
import path, { dirname } from 'path';
import swaggerUi from "swagger-ui-express";

import { estrategia, validacion } from './config/passport.js';
import { router as v1SalonesRutas } from './v1/rutas/salonesRutas.js';
import { router as v1ServiciosRutas } from "./v1/rutas/serviciosRutas.js";
import { router as v1TurnosRutas } from './v1/rutas/turnosRutas.js';
import { router as v1UsuariosRutas } from './v1/rutas/usuariosRutas.js';
import { router as v1ReservasRutas } from './v1/rutas/reservasRutas.js';
import { router as v1AuthRouter } from './v1/rutas/authRoutes.js';
import { router as invitadosRouter } from "./v1/rutas/invitadosRutas.js";
import { buildSwaggerSpec } from "./docs/swagger.js";

// Para ESM __dirname
const __dirname = path.resolve();

// Crear app primero
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Carpeta para HTML/CSS/JS
app.use(passport.initialize());
passport.use(estrategia);
passport.use(validacion);

// Morgan logs
const log = fs.createWriteStream('./access.log', { flags: 'a' });
app.use(morgan('combined')); // consola
app.use(morgan('combined', { stream: log })); // archivo

// Swagger
const swaggerSpec = buildSwaggerSpec();
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api/v1/auth', v1AuthRouter);

app.use('/api/v1/usuarios', passport.authenticate('jwt', { session:false }), v1UsuariosRutas);
app.use('/api/v1/turnos', passport.authenticate('jwt', { session:false }), v1TurnosRutas);
app.use('/api/v1/servicios', passport.authenticate('jwt', { session:false }), v1ServiciosRutas);
app.use('/api/v1/salones', passport.authenticate('jwt', { session:false }), v1SalonesRutas);
app.use('/api/v1/reservas', passport.authenticate('jwt', { session:false }), v1ReservasRutas);
app.use("/api/v1/invitados", passport.authenticate('jwt', { session:false }), invitadosRouter);

// Ruta del login (HTML)
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Ruta del dashboard (HTML)
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});


// Variables de entorno
process.loadEnvFile();

// Levantar servidor
const PORT = process.env.PUERTO || 3000;
app.listen(PORT, () => {
    console.log(`Servidor arriba en Puerto: ${PORT}`);
});

