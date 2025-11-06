import Invitados from "../db/invitados.js";
import Reservas from "../db/reservas.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

export default class InvitadosServicio {
  constructor() {
    this.invitados = new Invitados();
    this.reservas = new Reservas();
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

    // Validar reserva existente
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
}
