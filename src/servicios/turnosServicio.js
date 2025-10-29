import Turnos from "../db/turnos.js";

export default class TurnosServicio {
  constructor() {
    this.model = new Turnos();
  }

  async buscarTodos() {
    return this.model.buscarTodos();
  }

  async obtenerTurnoPorId(turno_id) {
    const datos = await this.model.obtenerTurnoPorId(turno_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Turno no encontrado.");
      err.status = 404;
      throw err;
    }
    return datos[0];
  }

  async crearTurno(payload) {
    const { orden, hora_desde, hora_hasta } = payload;

    if (!orden || Number(orden) < 1) {
      const err = new Error("Faltan campos requeridos.");
      err.status = 400;
      throw err;
    }

    if (!hora_desde || !hora_hasta) {
      const err = new Error("Faltan campos requeridos.");
      err.status = 400;
      throw err;
    }

    const result = await this.model.crearTurno({
      orden: Number(orden),
      hora_desde: String(hora_desde),
      hora_hasta: String(hora_hasta)
    });

    return result.insertId;
  }

  async actualizarTurno(turno_id, payload) {
    const existente = await this.model.obtenerTurnoPorId(turno_id);
    if (!existente || existente.length === 0) {
      const err = new Error("Turno no encontrado.");
      err.status = 404;
      throw err;
    }

    const { orden, hora_desde, hora_hasta } = payload;

    if (!orden || Number(orden) < 1 || !hora_desde || !hora_hasta) {
      const err = new Error("Faltan campos requeridos.");
      err.status = 400;
      throw err;
    }

    const result = await this.model.actualizarTurno(turno_id, {
      orden: Number(orden),
      hora_desde: String(hora_desde),
      hora_hasta: String(hora_hasta)
    });

    if (result.affectedRows === 0) {
      const err = new Error("Turno no encontrado.");
      err.status = 404;
      throw err;
    }
  }

  async eliminarTurno(turno_id) {
    const existente = await this.model.obtenerTurnoPorId(turno_id);
    if (!existente || existente.length === 0) {
      const err = new Error("Turno no encontrado.");
      err.status = 404;
      throw err;
    }

    const result = await this.model.eliminarTurno(turno_id);
    return result.affectedRows === 1;
  }
}
