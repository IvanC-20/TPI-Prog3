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

 
  async enviarInvitacionCumple({ invitado, reserva, salon = {}}) {
  try {
    const email = invitado?.email?.trim();
    if (!email || !email.includes("@")) {
      console.warn("[enviarInvitacionCumple] Invitado sin email válido, se omite:", invitado);
      return false;
    }

    const datos = {
      invitado: {
        invitado_id: invitado?.invitado_id ?? null,
        nombre: (invitado?.nombre && String(invitado.nombre).trim()) || "Invitado",
        email
      },
      reserva: {
        fecha: reserva?.fecha || "",                        
        hora: (reserva?.hora && String(reserva.hora).trim()) || "",
        tematica: (reserva?.tematica && String(reserva.tematica).trim()) || ""
      },
      salon: {
        titulo: (salon?.titulo && String(salon.titulo).trim()) || "Salón",
        direccion: (salon?.direccion && String(salon.direccion).trim()) || ""
      }
    };

    const __filename = fileURLToPath(import.meta.url);
    const __dirname  = path.dirname(__filename);
    const plantillaPath = path.join(__dirname, "../utils/handlebars/invitacion.hbs");
    const plantilla = fs.readFileSync(plantillaPath, "utf-8");
    const template  = handlebars.compile(plantilla);
    const html      = template(datos);

    const subject = `🎂 Invitación: ${datos.reserva.fecha}${datos.reserva.hora ? " · " + datos.reserva.hora : ""} – ${datos.salon.titulo} 🎈`;
    const text =
      `¡Hola ${datos.invitado.nombre}! ` +
      `Te invito el día ${datos.reserva.fecha}` +
      (datos.reserva.hora ? ` a la hora ${datos.reserva.hora}` : "") +
      ` en ${datos.salon.titulo}${datos.salon.direccion ? " (" + datos.salon.direccion + ")" : ""}. ` +
      `Confirmá tu asistencia: http://localhost:3000/invitacion/confirmar?id=${datos.invitado.invitado_id}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USERCORREO,
        pass: process.env.PASSCORREO
      }
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: process.env.USERCORREO,
      to: datos.invitado.email,
      subject,
      html,
      text
    });

    console.log(`[enviarInvitacionCumple] OK → messageId=${info.messageId} → ${datos.invitado.email}`);
    return true;

  } catch (err) {
    console.error("[enviarInvitacionCumple] ERROR:", err);
    throw err;
  }
}

}
