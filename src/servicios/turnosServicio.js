import Turnos from "../db/turnos.js";

function esHoraValida(hhmmss) {
  if (typeof hhmmss !== "string") return false;
  if (!/^\d{2}:\d{2}:\d{2}$/.test(hhmmss)) return false;
  const [hh, mm, ss] = hhmmss.split(":").map(Number);
  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59 && ss >= 0 && ss <= 59;
}

export default class TurnosServicio {
  constructor() {
    this.model = new Turnos();
  }

  async listar() {
    return this.model.buscarTodos();
  }

  async obtenerPorId(turno_id) {
    const datos = await this.model.obtenerTurnoPorId(turno_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Turno no encontrado");
      err.status = 404;
      throw err;
    }
    return datos[0];
  }

  validarPayload(payload) {
    const errores = [];

    const ordenNum = payload?.orden != null ? Number(payload.orden) : null;
    if (!Number.isInteger(ordenNum) || ordenNum < 1) {
      errores.push({ campo: "orden", mensaje: "El orden debe ser un entero > 0" });
    }

    const desde = payload?.hora_desde;
    const hasta = payload?.hora_hasta;
    if (!esHoraValida(desde)) errores.push({ campo: "hora_desde", mensaje: "Use HH:MM:SS" });
    if (!esHoraValida(hasta)) errores.push({ campo: "hora_hasta", mensaje: "Use HH:MM:SS" });

    if (esHoraValida(desde) && esHoraValida(hasta) && !(desde < hasta)) {
      errores.push({ campo: "rango", mensaje: "hora_desde debe ser menor que hora_hasta" });
    }

    if (errores.length) {
      const err = new Error("Validación de turnos fallida");
      err.status = 400;
      err.errores = errores;
      throw err;
    }
    return { orden: ordenNum, hora_desde: desde, hora_hasta: hasta };
  }

  async crear(payload) {
    const limpio = this.validarPayload(payload);
    const result = await this.model.crearTurno(limpio);
    return result.insertId;
  }

  async actualizar(turno_id, payload) {
    const limpio = this.validarPayload(payload);
    const result = await this.model.actualizarTurno(turno_id, limpio);
    if (result.affectedRows === 0) {
      const err = new Error("Turno no encontrado o inactivo");
      err.status = 404;
      throw err;
    }
  }

  async eliminar(turno_id) {
    const result = await this.model.eliminarTurno(turno_id);
    if (result.affectedRows === 0) {
      const err = new Error("Turno no encontrado");
      err.status = 404;
      throw err;
    }
  }
}
