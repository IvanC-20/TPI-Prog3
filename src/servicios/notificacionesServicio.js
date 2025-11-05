import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

export default class NotificacionesServicio {

  enviarCorreo = async (datosCorreo) => {
    try {
      // 1. Cargar plantilla handlebars
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const plantillaPath = path.join(__dirname, '../utils/handlebars/plantilla.hbs');

      const plantilla = fs.readFileSync(plantillaPath, 'utf-8');
      const template = handlebars.compile(plantilla);

      // 2. Armar datos para la plantilla
      const datosReserva = datosCorreo?.[0] ?? [];
      const datosAdmins = datosCorreo?.[1] ?? [];

      const datos = {
        fecha: datosReserva.map(a => dayjs(a.fecha).format("DD/MM/YYYY")),
        salon: datosReserva.map(a => a.salon),
        turno: datosReserva.map(a => a.turno)
      };

      const correoHtml = template(datos);

      // 3. Crear transporter Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.USERCORREO,
          pass: process.env.PASSCORREO
        }
      });

      await transporter.verify();

      // 4. Destinatarios
      const correosCliente = datosReserva
      .map(r => r.correoCliente)
      .filter(c => !!c && c.includes('@'));
    
      const correosAdmin = datosAdmins
        .map(a => a.correoAdmin)
        .filter(c => !!c && c.includes('@'));
      
      const todosLosDestinatarios = Array.from(
        new Set([...correosCliente, ...correosAdmin])
      ).join(', ');
      
      const mailOptions = {
        from: process.env.USERCORREO,
        to: todosLosDestinatarios,
        subject: "Nueva Reserva 🎉",
        html: correoHtml
      };

      // 5. Enviar mail y esperar resultado
      const info = await transporter.sendMail(mailOptions);

      console.log("Correo enviado OK. messageId =", info.messageId);
      return true;

    } catch (err) {
      console.error("Error enviando correo:", err);
      // re-lanzamos para que el caller (ReservasServicio) pueda loguear "no se pudo enviar correo"
      throw err;
    }
  };

  // placeholders (todavía sin implementación)
  enviarMensaje = async (datos) => {};
  enviarWhatsapp = async (datos) => {};
  enviarNotificacionPush = async (datos) => {};
}
