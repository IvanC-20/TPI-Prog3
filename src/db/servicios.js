import { conexion } from "./conexion.js";

export default class Servicios {
  async buscarTodos() {
    const sql = "SELECT * FROM servicios WHERE activo = 1 ORDER BY creado DESC";
    const [rows] = await conexion.execute(sql);
    return rows;
  }

  async obtenerServicioPorId(servicio_id) {
    const sql = "SELECT * FROM servicios WHERE activo = 1 AND servicio_id = ?";
    const [rows] = await conexion.execute(sql, [servicio_id]);
    return rows;
  }

  async crearServicio({ descripcion, importe }) {
    const ahora = new Date();
    const sql = `INSERT INTO servicios (descripcion, importe, creado, modificado, activo)
                 VALUES (?,?,?,?,1)`;
    const valores = [descripcion, importe ?? null, ahora, ahora];
    const [result] = await conexion.execute(sql, valores);
    return { insertId: result.insertId };
  }

  async actualizarServicio(servicio_id, { descripcion, importe }) {
    const ahora = new Date();
    const sql = `UPDATE servicios
                 SET descripcion = ?, importe = ?, modificado = ?
                 WHERE servicio_id = ? AND activo = 1`;
    const valores = [descripcion, importe ?? null, ahora, servicio_id];
    const [result] = await conexion.execute(sql, valores);
    return result; 
  }

  async eliminarServicio(servicio_id) {
    const ahora = new Date();
    const sql = `UPDATE servicios SET activo = 0, modificado = ? WHERE servicio_id = ? AND activo = 1`;
    const [result] = await conexion.execute(sql, [ahora, servicio_id]);
    return result; 
  }
}
