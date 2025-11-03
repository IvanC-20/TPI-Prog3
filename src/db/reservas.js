import { conexion } from "./conexion.js";

export default class Reservas {

  async serviciosPorReserva(reserva_id) {
    const sql = `
      SELECT 
        rs.servicio_id,
        sv.descripcion,
        rs.importe
      FROM reservas_servicios rs
      JOIN servicios sv ON sv.servicio_id = rs.servicio_id
      WHERE rs.reserva_id = ?
        AND sv.activo = 1
    `;
    const [rows] = await conexion.execute(sql, [reserva_id]);
    return rows.map(s => ({
      servicio_id: s.servicio_id,
      descripcion: s.descripcion,
      importe: s.importe
    }));
  }

  armarReservaJson(row, servicios) {
    return {
      reserva_id: row.reserva_id,
      fecha_reserva: row.fecha_reserva,
      foto_cumpleaniero: row.foto_cumpleaniero,
      tematica: row.tematica,
      creado: row.creado,
      modificado: row.modificado,
      importe_salon: row.importe_salon,
      importe_total: row.importe_total,
      salon: {
        salon_id: row.salon_id,
        titulo: row.salon_titulo,
        direccion: row.salon_direccion
      },
      turno: {
        turno_id: row.turno_id,
        hora_desde: row.hora_desde,
        hora_hasta: row.hora_hasta
      },
      usuario: {
        usuario_id: row.usuario_id,
        nombre: row.usuario_nombre,
        apellido: row.usuario_apellido,
        celular: row.usuario_celular
      },
      servicios
    };
  }

  buscarPropias = async (usuario_id) => {
    const sql = `
      SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.salon_id,
        r.usuario_id,
        r.turno_id,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.creado,
        r.modificado,
        s.titulo AS salon_titulo,
        s.direccion AS salon_direccion,
        t.hora_desde,
        t.hora_hasta,
        u.nombre AS usuario_nombre,
        u.apellido AS usuario_apellido,
        u.celular AS usuario_celular
      FROM reservas r
      JOIN salones s ON s.salon_id = r.salon_id
      JOIN turnos t ON t.turno_id = r.turno_id
      JOIN usuarios u ON u.usuario_id = r.usuario_id
      WHERE r.activo = 1 AND r.usuario_id = ?
      ORDER BY r.fecha_reserva DESC, r.creado DESC
    `;
    const [rows] = await conexion.execute(sql, [usuario_id]);
    const resultado = [];
    for (const row of rows) {
      const servicios = await this.serviciosPorReserva(row.reserva_id);
      resultado.push(this.armarReservaJson(row, servicios));
    }
    return resultado;
  }

  async buscarTodos() {
    const sql = `
      SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.salon_id,
        r.usuario_id,
        r.turno_id,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.creado,
        r.modificado,
        s.titulo AS salon_titulo,
        s.direccion AS salon_direccion,
        t.hora_desde,
        t.hora_hasta,
        u.nombre AS usuario_nombre,
        u.apellido AS usuario_apellido,
        u.celular AS usuario_celular
      FROM reservas r
      JOIN salones s ON s.salon_id = r.salon_id
      JOIN turnos t ON t.turno_id = r.turno_id
      JOIN usuarios u ON u.usuario_id = r.usuario_id
      WHERE r.activo = 1
      ORDER BY r.fecha_reserva DESC, r.creado DESC
    `;
    const [rows] = await conexion.execute(sql);
    const resultado = [];
    for (const row of rows) {
      const servicios = await this.serviciosPorReserva(row.reserva_id);
      resultado.push(this.armarReservaJson(row, servicios));
    }
    return resultado;
  }

  async obtenerReservaPorId(reserva_id) {
    const sql = `
      SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.salon_id,
        r.usuario_id,
        r.turno_id,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.creado,
        r.modificado,
        s.titulo AS salon_titulo,
        s.direccion AS salon_direccion,
        t.hora_desde,
        t.hora_hasta,
        u.nombre AS usuario_nombre,
        u.apellido AS usuario_apellido,
        u.celular AS usuario_celular
      FROM reservas r
      JOIN salones s ON s.salon_id = r.salon_id
      JOIN turnos t ON t.turno_id = r.turno_id
      JOIN usuarios u ON u.usuario_id = r.usuario_id
      WHERE r.activo = 1 AND r.reserva_id = ?
      LIMIT 1
    `;
    const [rows] = await conexion.execute(sql, [reserva_id]);
    if (rows.length === 0) return [];
    const row = rows[0];
    const servicios = await this.serviciosPorReserva(reserva_id);
    return [this.armarReservaJson(row, servicios)];
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
