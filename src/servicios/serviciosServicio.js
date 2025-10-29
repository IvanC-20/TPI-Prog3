import Servicios from "../db/servicios.js";

export default class ServiciosServicio {
  constructor() {
    this.model = new Servicios();
  }

  async buscarTodos() {
    return await this.model.buscarTodos();
  }

  async obtenerServicioPorId(servicio_id) {
    const datos = await this.model.obtenerServicioPorId(servicio_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Servicio no encontrado.");
      err.status = 404;
      throw err;
    }
    return datos[0];
  }

  async crearServicio(payload) {
    const { descripcion, importe } = payload;

    if (!descripcion || String(descripcion).trim().length < 3) {
      const err = new Error("Faltan campos requeridos.");
      err.status = 400;
      throw err;
    }

    if (importe == null || Number(importe) < 0) {
      const err = new Error("Faltan campos requeridos.");
      err.status = 400;
      throw err;
    }

    const result = await this.model.crearServicio({
      descripcion: String(descripcion).trim(),
      importe: Number(importe)
    });

    return result.insertId;
  }

  async actualizarServicio(servicio_id, payload) {
    const existente = await this.model.obtenerServicioPorId(servicio_id);
    if (!existente || existente.length === 0) {
      const err = new Error("Servicio no encontrado.");
      err.status = 404;
      throw err;
    }

    const { descripcion, importe } = payload;

    if (!descripcion || String(descripcion).trim().length < 3) {
      const err = new Error("Faltan campos requeridos.");
      err.status = 400;
      throw err;
    }

    if (importe == null || Number(importe) < 0) {
      const err = new Error("Faltan campos requeridos.");
      err.status = 400;
      throw err;
    }

    const result = await this.model.actualizarServicio(servicio_id, {
      descripcion: String(descripcion).trim(),
      importe: Number(importe)
    });

    if (result.affectedRows === 0) {
      const err = new Error("Servicio no encontrado.");
      err.status = 404;
      throw err;
    }
  }

  async eliminarServicio(servicio_id) {
    const existente = await this.model.obtenerServicioPorId(servicio_id);
    if (!existente || existente.length === 0) {
      const err = new Error("Servicio no encontrado.");
      err.status = 404;
      throw err;
    }

    const result = await this.model.eliminarServicio(servicio_id);
    return result.affectedRows === 1;
  }
}
