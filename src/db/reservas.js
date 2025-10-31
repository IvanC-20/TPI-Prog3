import { conexion } from "./conexion.js";

export default class Reservas {

  buscarPropias = async(usuario_id) => {
    const sql = 'SELECT * FROM reservas WHERE activo = 1 AND usuario_id = ?';
    const [reservas] = await conexion.execute(sql, [usuario_id]);
    return reservas;
  }
  
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
    return { reserva_id: result.insertId };
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

  // por ahora hacemos una query para obtener todos los mails a los que vamos a enviar correo de la reserva generada
  datosParaNotificacion = async (reserva_id) => {
    const sqlReserva = `
      SELECT 
        r.fecha_reserva AS fecha,
        s.titulo        AS salon,
        CONCAT(
          LPAD(t.hora_desde, 5, '0'), ' - ', LPAD(t.hora_hasta, 5, '0')
        ) AS turno,
        u.nombre_usuario AS correoCliente
      FROM reservas r
      JOIN salones s ON s.salon_id = r.salon_id
      JOIN turnos  t ON t.turno_id = r.turno_id
      JOIN usuarios u ON u.usuario_id = r.usuario_id
      WHERE r.reserva_id = ?
        AND r.activo = 1
        AND u.activo = 1
    `;
    const [reservaRows] = await conexion.execute(sqlReserva, [reserva_id]);
    // chequear que tipo de usuario es admin, un detalle
    const sqlAdmins = `
      SELECT nombre_usuario AS correoAdmin
      FROM usuarios
      WHERE activo = 1
        AND tipo_usuario = 1 
        AND nombre_usuario LIKE '%@%'
    `;
    const [adminRows] = await conexion.execute(sqlAdmins);
  
    return [reservaRows, adminRows];
  };
  

}
