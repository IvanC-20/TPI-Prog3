import express from 'express';
import { router as v1SalonesRutas } from './v1/rutas/salonesRutas.js';
import { router as v1ServiciosRutas } from "./v1/rutas/serviciosRutas.js";
import { router as v1TurnosRutas } from './v1/rutas/turnosRutas.js';
import { router as v1UsuariosRutas } from './v1/rutas/usuariosRutas.js';

const app = express();

app.use(express.json());
app.use('/api/v1/salones', v1SalonesRutas);
app.use('/api/v1/servicios', v1ServiciosRutas);
app.use('/api/v1/turnos', v1TurnosRutas);
app.use('/api/v1/usuarios', v1UsuariosRutas);

//cargamos las variables de entorno que estan definidas en el archivo .env (en el objeto process.env)
process.loadEnvFile();
//Inicio servidor en puerto especificado
app.listen(process.env.PUERTO, () => {
    console.log(`Servidor arriba en Puerto:  ${process.env.PUERTO}`)
})


