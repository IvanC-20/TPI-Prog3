import Reservas from "../db/reservas.js";

function esFechaISO(yyyy_mm_dd) {
  if (typeof yyyy_mm_dd !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyy_mm_dd)) return false;
  const d = new Date(yyyy_mm_dd + "T00:00:00Z");
  
  return !isNaN(d.getTime()) && yyyy_mm_dd === d.toISOString().slice(0, 10);
}

function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

function toDecimalOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n;
}

export default class ReservasServicio {
  constructor() {
    this.model = new Reservas();
  }

  async listar() {
    return this.model.buscarTodos();
  }

  async obtenerPorId(reserva_id) {
    const datos = await this.model.obtenerReservaPorId(reserva_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Reserva no encontrada");
      err.status = 404;
      throw err;
    }
    return datos[0];
  }

  validarPayload(payload) {
    const errores = [];

    const fecha_reserva = payload?.fecha_reserva;
    const salon_id = toInt(payload?.salon_id);
    const usuario_id = toInt(payload?.usuario_id);
    const turno_id = toInt(payload?.turno_id);

    const foto_cumpleaniero = payload?.foto_cumpleaniero != null ? String(payload.foto_cumpleaniero).trim() : null;
    const tematica = payload?.tematica != null ? String(payload.tematica).trim() : null;
    const importe_salon = toDecimalOrNull(payload?.importe_salon);
    const importe_total = toDecimalOrNull(payload?.importe_total);

    if (!esFechaISO(fecha_reserva)) {
      errores.push({ campo: "fecha_reserva", mensaje: "Formato inválido. Use YYYY-MM-DD" });
    }
    if (!Number.isInteger(salon_id)) {
      errores.push({ campo: "salon_id", mensaje: "Debe ser un número entero" });
    }
    if (!Number.isInteger(usuario_id)) {
      errores.push({ campo: "usuario_id", mensaje: "Debe ser un número entero" });
    }
    if (!Number.isInteger(turno_id)) {
      errores.push({ campo: "turno_id", mensaje: "Debe ser un número entero" });
    }
    if (importe_salon !== null && importe_salon < 0) {
      errores.push({ campo: "importe_salon", mensaje: "Debe ser un número positivo" });
    }
    if (importe_total !== null && importe_total < 0) {
      errores.push({ campo: "importe_total", mensaje: "Debe ser un número positivo" });
    }

    if (errores.length) {
      const err = new Error("Validación de reservas fallida");
      err.status = 400;
      err.errores = errores;
      throw err;
    }

    return {
      fecha_reserva,
      salon_id,
      usuario_id,
      turno_id,
      foto_cumpleaniero,
      tematica,
      importe_salon,
      importe_total
    };
  }

  async crear(payload) {
    const limpio = this.validarPayload(payload);
    const result = await this.model.crearReserva(limpio);
    return result.insertId;
  }

  async actualizar(reserva_id, payload) {
    const limpio = this.validarPayload(payload);
    const result = await this.model.actualizarReserva(reserva_id, limpio);
    if (result.affectedRows === 0) {
      const err = new Error("Reserva no encontrada o inactiva");
      err.status = 404;
      throw err;
    }
  }

  async eliminar(reserva_id) {
    const result = await this.model.eliminarReserva(reserva_id);
    if (result.affectedRows === 0) {
      const err = new Error("Reserva no encontrada");
      err.status = 404;
      throw err;
    }
  }
}
