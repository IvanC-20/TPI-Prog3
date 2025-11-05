import Turnos from "../db/turnos.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

export default class TurnosServicio {
  constructor() {
    this.model = new Turnos();
  }

  async buscarTodos() {
    const rows = await this.model.buscarTodos();
    return rows.map(turno => ({
      ...turno,
      creado: turno.creado ? dayjs(turno.creado).format("DD/MM/YYYY HH:mm") : null,
      modificado: turno.modificado ? dayjs(turno.modificado).format("DD/MM/YYYY HH:mm") : null
    }));
  }

  async obtenerTurnoPorId(turno_id) {
    const datos = await this.model.obtenerTurnoPorId(turno_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Turno no encontrado.");
      err.status = 404;
      throw err;
    }

    const turno = datos[0];
    return {
      ...turno,
      creado: turno.creado ? dayjs(turno.creado).format("DD/MM/YYYY HH:mm") : null,
      modificado: turno.modificado ? dayjs(turno.modificado).format("DD/MM/YYYY HH:mm") : null
    };
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

    const ahora = new Date();
    const result = await this.model.crearTurno({
      orden: Number(orden),
      hora_desde: String(hora_desde),
      hora_hasta: String(hora_hasta)
    });

    return {
      turno_id: result.insertId,
      orden: Number(orden),
      hora_desde: String(hora_desde),
      hora_hasta: String(hora_hasta),
      creado: dayjs(ahora).format("DD/MM/YYYY HH:mm"),
      modificado: dayjs(ahora).format("DD/MM/YYYY HH:mm")
    };
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

    const ahora = new Date();
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

    return {
      turno_id,
      orden: Number(orden),
      hora_desde: String(hora_desde),
      hora_hasta: String(hora_hasta),
      modificado: dayjs(ahora).format("DD/MM/YYYY HH:mm")
    };
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
