import express from 'express';
import passport from 'passport';
import morgan from 'morgan';
import fs from 'fs';  

import { estrategia, validacion} from './config/passport.js';
import { router as v1SalonesRutas } from './v1/rutas/salonesRutas.js';
import { router as v1ServiciosRutas } from "./v1/rutas/serviciosRutas.js";
import { router as v1TurnosRutas } from './v1/rutas/turnosRutas.js';
import { router as v1UsuariosRutas } from './v1/rutas/usuariosRutas.js';
import { router as v1ReservasRutas } from './v1/rutas/reservasRutas.js';
import { router as v1AuthRouter} from './v1/rutas/authRoutes.js';

const app = express();

// passport
app.use(passport.initialize());
passport.use(estrategia);
passport.use(validacion);

// Morgan
const log = fs.createWriteStream('./access.log', { flags: 'a' });
app.use(morgan('combined')); // logs en consola
app.use(morgan('combined', { stream: log })); // logs en el archivo access.log

app.use(express.json());

app.use('/api/v1/auth', v1AuthRouter); // auth
app.use('/api/v1/usuarios', v1UsuariosRutas); // SOLO NOSS QUEDA VER EN DETALLE USUARIOS

app.use('/api/v1/turnos', passport.authenticate('jwt', { session:false }), v1TurnosRutas);
app.use('/api/v1/servicios', passport.authenticate('jwt', { session:false }), v1ServiciosRutas);
app.use('/api/v1/salones', passport.authenticate( 'jwt', { session:false }), v1SalonesRutas);
app.use('/api/v1/reservas', passport.authenticate( 'jwt', { session:false }), v1ReservasRutas);

//cargamos las variables de entorno que estan definidas en el archivo .env (en el objeto process.env)
process.loadEnvFile();
//Inicio servidor en puerto especificado
app.listen(process.env.PUERTO, () => {
    console.log(`Servidor arriba en Puerto:  ${process.env.PUERTO}`)
})


