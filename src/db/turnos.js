import { conexion } from "./conexion.js";

export default class Turnos {
  async buscarTodos() {
    const sql = "SELECT * FROM turnos WHERE activo = 1 ORDER BY orden ASC, creado DESC";
    const [rows] = await conexion.execute(sql);
    return rows;
  }

  async obtenerTurnoPorId(turno_id) {
    const sql = "SELECT * FROM turnos WHERE activo = 1 AND turno_id = ?";
    const [rows] = await conexion.execute(sql, [turno_id]);
    return rows;
  }

  async crearTurno({ orden, hora_desde, hora_hasta }) {
    const ahora = new Date();
    const sql = `INSERT INTO turnos (orden, hora_desde, hora_hasta, creado, modificado, activo)
                 VALUES (?,?,?,?,?,1)`;
    const valores = [orden ?? null, hora_desde ?? null, hora_hasta ?? null, ahora, ahora];
    const [result] = await conexion.execute(sql, valores);
    return { insertId: result.insertId };
  }

  async actualizarTurno(turno_id, { orden, hora_desde, hora_hasta }) {
    const ahora = new Date();
    const sql = `UPDATE turnos
                 SET orden = ?, hora_desde = ?, hora_hasta = ?, modificado = ?
                 WHERE turno_id = ? AND activo = 1`;
    const valores = [orden ?? null, hora_desde ?? null, hora_hasta ?? null, ahora, turno_id];
    const [result] = await conexion.execute(sql, valores);
    return result; // result.affectedRows
  }

  async eliminarTurno(turno_id) {
    const ahora = new Date();
    const sql = `UPDATE turnos SET activo = 0, modificado = ? WHERE turno_id = ? AND activo = 1`;
    const [result] = await conexion.execute(sql, [ahora, turno_id]);
    return result; // result.affectedRows
  }
}
