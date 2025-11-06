import { conexion } from "./conexion.js";

export default class Invitados {
  async buscarTodos() {
    const sql = `
      SELECT invitado_id, reserva_id, nombre, apellido, email,
             confirmado, notificado, activo, creado, modificado
      FROM invitados
      WHERE activo = 1
      ORDER BY creado DESC, invitado_id DESC
    `;
    const [rows] = await conexion.execute(sql);
    return rows;
  }

  async buscarTodosPorUsuario(usuario_id) {
    const sql = `
      SELECT i.invitado_id, i.reserva_id, i.nombre, i.apellido, i.email,
             i.confirmado, i.notificado, i.activo, i.creado, i.modificado
      FROM invitados i
      JOIN reservas r ON r.reserva_id = i.reserva_id
      WHERE i.activo = 1 AND r.usuario_id = ?
      ORDER BY i.creado DESC, i.invitado_id DESC
    `;
    const [rows] = await conexion.execute(sql, [usuario_id]);
    return rows;
  }

  async obtenerInvitadoPorId(invitado_id) {
    const sql = `
      SELECT invitado_id, reserva_id, nombre, apellido, email,
             confirmado, notificado, activo, creado, modificado
      FROM invitados
      WHERE activo = 1 AND invitado_id = ?
    `;
    const [rows] = await conexion.execute(sql, [invitado_id]);
    return rows[0] || null;
  }

  async crearInvitado({ reserva_id, nombre, apellido = null, email = null, confirmado = 0, notificado = 0 }) {
    const sql = `
      INSERT INTO invitados (reserva_id, nombre, apellido, email, confirmado, notificado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const valores = [reserva_id, nombre, apellido, email, confirmado ? 1 : 0, notificado ? 1 : 0];
    const [result] = await conexion.execute(sql, valores);

    return {
      invitado_id: result.insertId,
      reserva_id,
      nombre,
      apellido,
      email,
      confirmado: !!confirmado,
      notificado: !!notificado,
      activo: 1
    };
  }

  async actualizarInvitado({ invitado_id, nombre, apellido, email, confirmado, notificado }) {
    const campos = [];
    const valores = [];
    const set = (c, v) => { campos.push(`${c} = ?`); valores.push(v); };

    if (nombre !== undefined) set("nombre", nombre);
    if (apellido !== undefined) set("apellido", apellido);
    if (email !== undefined) set("email", email);
    if (confirmado !== undefined) set("confirmado", confirmado ? 1 : 0);
    if (notificado !== undefined) set("notificado", notificado ? 1 : 0);

    if (!campos.length) return this.obtenerInvitadoPorId(invitado_id);

    const sql = `UPDATE invitados SET ${campos.join(", ")} WHERE invitado_id = ? AND activo = 1`;
    valores.push(invitado_id);
    await conexion.execute(sql, valores);
    return this.obtenerInvitadoPorId(invitado_id);
    
  }

  async eliminarInvitado(invitado_id) {
    const sql = `UPDATE invitados SET activo = 0 WHERE invitado_id = ?`;
    const [result] = await conexion.execute(sql, [invitado_id]);
    return result;
  }

  async buscarConEmailPorReserva(reserva_id, soloPendientes = true) {
    let sql = `
      SELECT invitado_id, reserva_id, nombre, apellido, email,
             confirmado, notificado, activo, creado, modificado
      FROM invitados
      WHERE activo = 1
        AND reserva_id = ?
        AND email IS NOT NULL
        AND email <> ''
    `;
    const params = [reserva_id];
    if (soloPendientes) sql += ` AND notificado = 0`;
    sql += ` ORDER BY creado DESC, invitado_id DESC`;
    const [rows] = await conexion.execute(sql, params);
    return rows;
  }

  async marcarNotificado(invitado_id) {
    const sql = `UPDATE invitados SET notificado = 1, modificado = NOW() WHERE invitado_id = ? AND activo = 1`;
    const [res] = await conexion.execute(sql, [invitado_id]);
    return res;
  }

  async marcarConfirmado(invitado_id) {
    const sql = `
      UPDATE invitados 
      SET confirmado = 1, modificado = NOW()
      WHERE invitado_id = ? AND activo = 1
    `;
    const [res] = await conexion.execute(sql, [invitado_id]);
    return res;
  }
}
