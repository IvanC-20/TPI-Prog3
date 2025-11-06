import Invitados from "../db/invitados.js";
import ReservasServicio from "./reservasServicio.js";
import NotificacionesServicio from "./notificacionesServicio.js";
import SalonesServicio from "./salonesServicio.js";
import TurnosServicio from "./turnosServicio.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

export default class InvitadosServicio {
  constructor() {
    this.invitados = new Invitados();                
    this.reservasServicio = new ReservasServicio();         
    this.salonesServicio  = new SalonesServicio();          
    this.turnosServicio   = new TurnosServicio();            
    this.notificaciones_servicio = new NotificacionesServicio();
  }

  // GET /api/v1/invitados
  async listarTodos(usuario) {
    if (!usuario) throw new Error("No autenticado.");

    if (usuario.tipo_usuario === 1 || usuario.tipo_usuario === 2) {
      const rows = await this.invitados.buscarTodos();
      return rows.map(inv => ({
        ...inv,
        creado: inv.creado ? dayjs(inv.creado).format("DD/MM/YYYY HH:mm") : null,
        modificado: inv.modificado ? dayjs(inv.modificado).format("DD/MM/YYYY HH:mm") : null
      }));
    }

    // Clientes: solo los invitados de sus reservas
    const rows = await this.invitados.buscarTodosPorUsuario(usuario.usuario_id);
    return rows.map(inv => ({
      ...inv,
      creado: inv.creado ? dayjs(inv.creado).format("DD/MM/YYYY HH:mm") : null,
      modificado: inv.modificado ? dayjs(inv.modificado).format("DD/MM/YYYY HH:mm") : null
    }));
  }

  // GET /api/v1/invitados/:invitado_id
  async obtenerInvitadoPorId(invitado_id) {
    const invitado = await this.invitados.obtenerInvitadoPorId(invitado_id);
    if (!invitado) throw new Error("Invitado no encontrado.");
    return {
      ...invitado,
      creado: invitado.creado ? dayjs(invitado.creado).format("DD/MM/YYYY HH:mm") : null,
      modificado: invitado.modificado ? dayjs(invitado.modificado).format("DD/MM/YYYY HH:mm") : null
    };
  }

  // POST /api/v1/invitados (reserva_id en body)
  async crear(data) {
    const { reserva_id, nombre, apellido, email, confirmado, notificado } = data || {};
    if (!reserva_id || !nombre) {
      throw new Error("reserva_id y nombre son obligatorios.");
    }

    // Validar reserva existente (vía servicio)
    const reserva = await this.reservas.obtenerReservaPorId(reserva_id);
    if (!reserva) throw new Error("La reserva especificada no existe.");

    const ahora = new Date();
    const creado = await this.invitados.crearInvitado({
      reserva_id,
      nombre,
      apellido,
      email,
      confirmado: confirmado ? 1 : 0,
      notificado: notificado ? 1 : 0
    });

    return {
      ...creado,
      creado: dayjs(ahora).format("DD/MM/YYYY HH:mm"),
      modificado: dayjs(ahora).format("DD/MM/YYYY HH:mm")
    };
  }

  // PUT /api/v1/invitados/:invitado_id
  async actualizar(invitado_id, data) {
    const existente = await this.invitados.obtenerInvitadoPorId(invitado_id);
    if (!existente) throw new Error("Invitado no encontrado.");

    const { nombre, apellido, email, confirmado, notificado } = data || {};
    await this.invitados.actualizarInvitado({
      invitado_id,
      nombre,
      apellido,
      email,
      confirmado,
      notificado
    });

    const actualizado = await this.invitados.obtenerInvitadoPorId(invitado_id);
    return {
      ...actualizado,
      modificado: actualizado.modificado
        ? dayjs(actualizado.modificado).format("DD/MM/YYYY HH:mm")
        : null
    };
  }

  // DELETE /api/v1/invitados/:invitado_id
  async eliminar(invitado_id) {
    const existente = await this.invitados.obtenerInvitadoPorId(invitado_id);
    if (!existente) return false;

    const result = await this.invitados.eliminarInvitado(invitado_id);
    return result.affectedRows === 1;
  }

  // POST /api/v1/invitados/notificar
  async notificarInvitados(data, usuario) {
    const { reserva_id } = data || {};

    // Autenticación y permisos
    if (!usuario) {
      throw Object.assign(new Error("No autenticado."), { status: 401 });
    }
    if (usuario.tipo_usuario !== 1 && usuario.tipo_usuario !== 2) {
      throw Object.assign(new Error("No tiene permiso para notificar invitados."), { status: 403 });
    }
    if (!reserva_id) {
      throw Object.assign(new Error("reserva_id es obligatorio."), { status: 400 });
    }

    // Reserva (vía servicio)
    const reserva = await this.reservasServicio.buscarPorId(Number(reserva_id));
    if (!reserva) {
      throw Object.assign(new Error("Reserva no encontrada."), { status: 404 });
    }

    // Salón (opcional, vía servicio)
    let salon = null;
    try {
      salon = reserva.salon_id ? await this.salonesServicio.obtenerSalonPorId(reserva.salon_id) : null;
    } catch {}

    // Turno (opcional, vía servicio)
    let turno = null;
    try {
      turno = reserva.turno_id ? await this.turnosServicio.obtenerTurnoPorId(reserva.turno_id) : null;
    } catch {}

    // Fecha (DD/MM/YYYY)
    const fechaStr = reserva.fecha_reserva
      ? dayjs(reserva.fecha_reserva).format("DD/MM/YYYY")
      : "";

    // Hora / rango (del servicio de turnos: horaLabel)
    const horaStr = turno?.horaLabel || "";

    // Invitados pendientes (con email y notificado = 0)
    const pendientes = await this.invitados.buscarConEmailPorReserva(Number(reserva_id), true);
    if (!pendientes.length) {
      return { total: 0, enviados: 0, fallidos: 0, detalles: [] };
    }

    // Concurrencia básica para evitar rate limit
    const CHUNK = 5;
    const detalles = [];

    for (let i = 0; i < pendientes.length; i += CHUNK) {
      const slice = pendientes.slice(i, i + CHUNK);

      const resultados = await Promise.allSettled(
        slice.map(async (inv) => {
          await this.notificaciones_servicio.enviarInvitacionCumple({
            invitado: {
              invitado_id: inv.invitado_id,
              nombre: inv.nombre || "Invitado",
              email: inv.email
            },
            reserva: {
              fecha: fechaStr,
              hora: horaStr,
              tematica: reserva.tematica || ""
            },
            salon: salon ? { titulo: salon.titulo || "", direccion: salon.direccion || "" } : {},
            public_base_url: process.env.PUBLIC_BASE_URL || "http://localhost:3000"
          });

          await this.invitados.marcarNotificado(inv.invitado_id);
          return { invitado_id: inv.invitado_id, email: inv.email, ok: true };
        })
      );

      resultados.forEach((r, idx) => {
        const inv = slice[idx];
        if (r.status === "fulfilled") detalles.push(r.value);
        else detalles.push({ invitado_id: inv.invitado_id, email: inv.email, ok: false, error: r.reason?.message || "Error envío" });
      });
    }

    const enviados = detalles.filter(d => d.ok).length;
    const fallidos = detalles.length - enviados;
    return { total: detalles.length, enviados, fallidos, detalles };
  }

  // GET /api/v1/invitados/confirmar?id=...
  async confirmarAsistencia(invitado_id) {
    const inv = await this.invitados.obtenerInvitadoPorId(invitado_id);
    if (!inv) return { estado: "no_encontrado" };

    if (inv.confirmado === 1 || inv.confirmado === true) {
      return { estado: "ya_confirmado" };
    }

    await this.invitados.marcarConfirmado(invitado_id);
    return { estado: "confirmado_ok" };
  }
}
