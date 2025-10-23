import { conexion } from "./conexion.js";

export default class Reservas {
  async buscarTodos() {
    const sql = `
      SELECT reserva_id, fecha_reserva, salon_id, usuario_id, turno_id,
             foto_cumpleaniero, tematica, importe_salon, importe_total,
             creado, modificado
      FROM reservas
      WHERE activo = 1
      ORDER BY fecha_reserva DESC, creado DESC
    `;
    const [rows] = await conexion.execute(sql);
    return rows;
  }

  async obtenerReservaPorId(reserva_id) {
    const sql = `
      SELECT reserva_id, fecha_reserva, salon_id, usuario_id, turno_id,
             foto_cumpleaniero, tematica, importe_salon, importe_total,
             creado, modificado
      FROM reservas
      WHERE activo = 1 AND reserva_id = ?
    `;
    const [rows] = await conexion.execute(sql, [reserva_id]);
    return rows;
  }

  async crearReserva({
    fecha_reserva, salon_id, usuario_id, turno_id,
    foto_cumpleaniero, tematica, importe_salon, importe_total
  }) {
    const ahora = new Date();
    const sql = `
      INSERT INTO reservas
        (fecha_reserva, salon_id, usuario_id, turno_id,
         foto_cumpleaniero, tematica, importe_salon, importe_total,
         creado, modificado, activo)
      VALUES (?,?,?,?,?,?,?,?,?,?,1)
    `;
    const valores = [
      fecha_reserva,
      salon_id,
      usuario_id,
      turno_id,
      foto_cumpleaniero ?? null,
      tematica ?? null,
      importe_salon ?? null,
      importe_total ?? null,
      ahora,
      ahora
    ];
    const [result] = await conexion.execute(sql, valores);
    return { insertId: result.insertId };
  }

  async actualizarReserva(reserva_id, {
    fecha_reserva, salon_id, usuario_id, turno_id,
    foto_cumpleaniero, tematica, importe_salon, importe_total
  }) {
    const ahora = new Date();
    const sql = `
      UPDATE reservas
      SET fecha_reserva = ?, salon_id = ?, usuario_id = ?, turno_id = ?,
          foto_cumpleaniero = ?, tematica = ?, importe_salon = ?, importe_total = ?,
          modificado = ?
      WHERE reserva_id = ? AND activo = 1
    `;
    const valores = [
      fecha_reserva,
      salon_id,
      usuario_id,
      turno_id,
      foto_cumpleaniero ?? null,
      tematica ?? null,
      importe_salon ?? null,
      importe_total ?? null,
      ahora,
      reserva_id
    ];
    const [result] = await conexion.execute(sql, valores);
    return result; 
  }

  async eliminarReserva(reserva_id) {
    const ahora = new Date();
    const sql = `UPDATE reservas SET activo = 0, modificado = ? WHERE reserva_id = ? AND activo = 1`;
    const [result] = await conexion.execute(sql, [ahora, reserva_id]);
    return result; 
  }
}
