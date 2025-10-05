import { conexion } from "./conexion.js";

export default class Salones {
  async buscarTodos() {
    const sql = "SELECT * FROM salones WHERE activo = 1;";
    const [salones] = await conexion.execute(sql);
    return salones;
  }

  async obtenerSalonPorId(salon_id) {
    const sql = "SELECT * FROM salones WHERE activo = 1 AND salon_id = ?";
    const [results] = await conexion.execute(sql, [salon_id]);
    return results;
  }

  async crearSalon({ titulo, direccion, capacidad, importe }) {
    const sql = `INSERT INTO salones (titulo, direccion, capacidad, importe)
                 VALUES (?, ?, ?, ?)`;
    const valores = [titulo, direccion, capacidad, importe];
    const [result] = await conexion.execute(sql, valores);
    return result;
  }

  async actualizarSalon({ salon_id, titulo, direccion, capacidad, importe }) {
    const sql = `UPDATE salones
                 SET titulo = ?, direccion = ?, capacidad = ?, importe = ?
                 WHERE salon_id = ?`;
    const valores = [titulo, direccion, capacidad, importe, salon_id];
    const [result] = await conexion.execute(sql, valores);
    return result;
  }

  async eliminarSalon(salon_id) {
    const sql = `UPDATE salones SET activo = 0 WHERE salon_id = ?`;
    const [result] = await conexion.execute(sql, [salon_id]);
    return result;
  }
}
