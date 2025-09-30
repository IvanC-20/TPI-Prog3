import express from "express";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import path from "path";
import { conexion } from "./db/conexion.js";


const app = express();
//reservas, reservas2025
//Midleware para parchear json en las peticiones
app.use(express.json());

app.get('/estado', (req, res) => {
    //res.json({'ok': true});
    res.status(201).send({ 'estado': true, 'Mensaje': 'Reserva creada!' });
})

app.post('/notificacion', async (req, res) => {
    console.log(req.body);
    const { fecha, salon, turno, correoDestino } = req.body;

    if (!req.body.fecha || !req.body.salon || !req.body.turno || !req.body.correoDestino) {
        res.status(400).send({ 'estado': false, 'Mensaje': 'Faltan datos requeridos' });
    }

    try {
        //me da url del archivo actual, con fileURLToPath convierto en una ruta absoluta 
        // del sistema, la ruta del archivo actual
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const plantilla = path.join(__dirname, 'utils', 'handlebars', 'plantilla.hbs');
        //dirección absoluta plantilla
        //console.log(plantilla);
        //leo plantilla
        const datos = await readFile(plantilla, 'utf-8');
        //compilo plantilla
        const template = handlebars.compile(datos);
        //paso los datos a mi plantilla
        var html = template(
            {
                fecha: fecha,
                salon: salon,
                turno: turno,
                correoDestino: correoDestino
            });

        //console.log(html)


        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        const opciones = {
            to: correoDestino,
            subject: 'Notificación',
            html: html
        };

        transporter.sendMail(opciones, (error, info) => {
            if (error) {
                console.log(error);
                res.json({ 'ok': false, 'mensaje': 'Error al enviar!' });
            }
            console.log(info);
            res.json({ 'ok': true, 'mensaje': 'Correo enviado!' });
        });

    } catch (error) {
        console.log(error);
    }

    //res.json({'oki': true});
})

//ruta para obtener un salón
app.get('/salones/:salon_id', async (req, res) => {
    try {
        const salon_id = req.params.salon_id;
        const sql = `SELECT * FROM salones WHERE activo = 1 and salon_id = ?`;
        const valores = [salon_id];
        //usando sentencias preparadas evitamos la injección sql,
        //los datos del array se vinculan de forma segura a la consulta
        const [results, fields] = await conexion.execute(sql, valores);

        if (results.length === 0) {
            return res.status(404).json({
                estado: false,
                mensaje: "Salón no encontrado."
            })
        }

        //console.log(results); // results contains rows returned by server
        //console.log(fields); // fields contains extra meta data about results, if available
        res.json({
            estado: true,
            salon: results[0]
        });

    } catch (err) {
        console.log("Error en GET/salones/:salon_id", err);
        res.status(500).json({
            estado: false,
            mensaje: "Error interno del servidor."
        })
    }

})

app.post('/salones', async (req, res) => {

    try {

        //falta validar con express validator, queda para mas adelante con un middleware
        //control datos requeridos
        if (!req.body.titulo || !req.body.direccion || !req.body.capacidad || !req.body.importe) {
            return res.status(400).json({
                estado: false,
                mensaje: "Faltan campos requeridos."
            })
        }

        const { titulo, direccion, capacidad, importe } = req.body;
        const valores = [titulo, direccion, capacidad, importe];
        const sql = `INSERT INTO salones (titulo, direccion, capacidad, importe) 
                    VALUES (?,?,?,?)`;


        const result = await conexion.execute(sql, valores);
        console.log(result);
        res.status(201).json({
            estado: true,
            mensaje: `Salón creado con id: ${result[0].insertId}`,
            Salon: {
                titulo: valores[0],
                direccion: valores[1],
                capacidad: valores[2],
                importe: valores[3]

            }
        });

    } catch (err) {
        console.log("Error en POST/salones", err);
        res.status(500).json({
            estado: false,
            mensaje: "Error interno del servidor."
        })
    }
})

app.put("/salones/:salon_id", async (req, res) => {
    try {
        const salon_id = req.params.salon_id;

        const sql = `SELECT * FROM salones WHERE activo = 1 and salon_id = ?`;

        //usando sentencias preparadas evitamos la injección sql,
        //los datos del array se vinculan de forma segura a la consulta
        const [results] = await conexion.execute(sql, [salon_id]);

        if (results.length === 0) {
            return res.status(404).json({
                estado: false,
                mensaje: "Salón no existe."
            })
        }

        if (!req.body.titulo || !req.body.direccion || !req.body.capacidad || !req.body.importe) {
            return res.status(400).json({
                estado: false,
                mensaje: "Faltan campos requeridos."
            })
        }

        const { titulo, direccion, capacidad, importe } = req.body;
        const valores = [titulo, direccion, capacidad, importe, salon_id];
        const sql1 = `UPDATE salones SET titulo=?, direccion=?, capacidad=?, importe=? 
                    WHERE salon_id = ?`;


        const result = await conexion.execute(sql1, valores);
        console.log(result);
        res.status(200).json({
            estado: true,
            mensaje: `Salón modificado.`,
            Salon: {
                titulo: valores[0],
                direccion: valores[1],
                capacidad: valores[2],
                importe: valores[3]
            }
        })
    } catch (error) {
        console.log("Error en PUT/salones/:salon_id", error);
        res.status(500).json({
            estado: false,
            mensaje: "Error interno del servidor."
        })

    }
})

app.delete("/salones/:salon_id", async (req, res) => {

    try {
        const salon_id = req.params.salon_id;

        const sql = `SELECT * FROM salones WHERE activo = 1 and salon_id = ?`;

        //usando sentencias preparadas evitamos la injección sql,
        //los datos del array se vinculan de forma segura a la consulta
        const [results] = await conexion.execute(sql, [salon_id]);

        if (results.length === 0) {
            return res.status(404).json({
                estado: false,
                mensaje: "Salón no existe."
            })
        }

        const valores = [0, salon_id];
        const sql1 = `UPDATE salones SET activo=? 
                    WHERE salon_id = ?`;


        const [result] = await conexion.execute(sql1, valores);
        console.log(result);
        if (result.affectedRows == 1) {
            res.status(200).json({
                estado: true,
                mensaje: `Salón ${salon_id} eliminado. (Estado activo = 0)`,

            })
        }
    } catch (error) {
        console.log("Error en PATCH/salones/:salon_id", error);
        res.status(500).json({
            estado: false,
            mensaje: "Error interno del servidor."
        })
    }

})

//cargamos las variables de entorno que estan definidas en el archivo .env (en el objeto process.env)
process.loadEnvFile();
//Inicio servidor en puerto especificado
app.listen(process.env.PUERTO, () => {
    console.log(`Servidor arriba en Puerto:  ${process.env.PUERTO}`)
})
