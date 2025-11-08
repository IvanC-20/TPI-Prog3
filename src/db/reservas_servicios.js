import { conexion } from "./conexion.js";

export default class ReservasServicios {
  async crear(reserva_id, servicios = []) {
    if (!Array.isArray(servicios) || servicios.length === 0) return;

    const values = servicios.map(s => [
      reserva_id,
      s.servicio_id ?? null,
      s.importe ?? null
    ]);

    const sql = `
      INSERT INTO reservas_servicios (reserva_id, servicio_id, importe)
      VALUES ?
    `;

    await conexion.query(sql, [values]);
  }

  async reemplazar(reserva_id, servicios = []) {
    // borro todos los servicios anteriores de esa reserva
    await conexion.query(
      "DELETE FROM reservas_servicios WHERE reserva_id = ?",
      [reserva_id]
    );

    // inserto los nuevos
    await this.crear(reserva_id, servicios);
  }
}
