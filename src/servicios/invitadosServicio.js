import Invitados from "../db/invitados.js";
import NotificacionesServicio from "./notificacionesServicio.js";
import ReservasServicio from "../servicios/reservasServicio.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

export default class InvitadosServicio {
  constructor() {
    this.invitados = new Invitados();                          
    this.notificaciones_servicio = new NotificacionesServicio();
    this.reservasServicio = new ReservasServicio();
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

  // POST /api/v1/invitados 
  async crear(data) {
    const { reserva_id, nombre, apellido, email, confirmado, notificado } = data || {};
    if (!reserva_id || !nombre) {
      throw new Error("reserva_id y nombre son obligatorios.");
    }
    
    const reserva = await this.reservasServicio.buscarPorId(reserva_id);
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
    const TAG = "[InvitadosServicio.notificarInvitados]";

    const { reserva_id } = data || {};

    // permisos
    if (!usuario) throw Object.assign(new Error("No autenticado."), { status: 401 });
    if (usuario.tipo_usuario !== 1 && usuario.tipo_usuario !== 2) {
      throw Object.assign(new Error("No tiene permiso para notificar invitados."), { status: 403 });
    }
    if (!reserva_id) throw Object.assign(new Error("reserva_id es obligatorio."), { status: 400 });

    const rows = await this.invitados.buscarPendientesConContexto(Number(reserva_id), true);

    if (!rows.length) {
      return { total: 0, enviados: 0, fallidos: 0, detalles: [] };
    }

    const ctxReserva = {
      fecha: rows[0].fecha_str,          
      hora: rows[0].hora_label,         
      tematica: rows[0].tematica || ""
    };
    const ctxSalon = {
      titulo: rows[0].salon_titulo || "Salón",
      direccion: rows[0].salon_direccion || ""
    };

    // Envíos por tandas
    const CHUNK = 5;
    const detalles = [];

    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK);

      const resultados = await Promise.allSettled(
        slice.map(async (r, idx) => {
          const invitadoCtx = {
            invitado_id: r.invitado_id,
            nombre: (r.invitado_nombre && String(r.invitado_nombre).trim()) || "Invitado",
            email: r.invitado_email
          };

          await this.notificaciones_servicio.enviarInvitacionCumple({
            invitado: invitadoCtx,
            reserva: ctxReserva, 
            salon: ctxSalon
          });

          await this.invitados.marcarNotificado(r.invitado_id);

          return { invitado_id: r.invitado_id, email: r.invitado_email, ok: true };
        })
      );

      resultados.forEach((r, idx) => {
        const row = slice[idx];
        if (r.status === "fulfilled") {
          detalles.push(r.value);
        } else {
          detalles.push({ invitado_id: row.invitado_id, email: row.invitado_email, ok: false, error: r.reason?.message || "Error envío" });
        }
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
