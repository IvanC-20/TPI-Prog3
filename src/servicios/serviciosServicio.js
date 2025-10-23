import Servicios from "../db/servicios.js";

export default class ServiciosServicio {
  constructor() {
    this.model = new Servicios();
  }

  async listar() {
    return this.model.buscarTodos();
  }

  async obtenerPorId(servicio_id) {
    const datos = await this.model.obtenerServicioPorId(servicio_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Servicio no encontrado");
      err.status = 404;
      throw err;
    }
    return datos[0];
  }

  async crear(payload) {
    if (!payload?.descripcion || String(payload.descripcion).trim().length < 3) {
      const err = new Error("La descripción es obligatoria (mín. 3 caracteres)");
      err.status = 400;
      throw err;
    }
    if (payload.importe != null && Number(payload.importe) < 0) {
      const err = new Error("El importe debe ser mayor o igual a 0");
      err.status = 400;
      throw err;
    }
    const result = await this.model.crearServicio({
      descripcion: String(payload.descripcion).trim(),
      importe: payload.importe != null ? Number(payload.importe) : null
    });
    return result.insertId;
  }

  async actualizar(servicio_id, payload) {
    if (!payload?.descripcion || String(payload.descripcion).trim().length < 3) {
      const err = new Error("La descripción es obligatoria (mín. 3 caracteres)");
      err.status = 400;
      throw err;
    }
    if (payload.importe != null && Number(payload.importe) < 0) {
      const err = new Error("El importe debe ser mayor o igual a 0");
      err.status = 400;
      throw err;
    }
    const result = await this.model.actualizarServicio(servicio_id, {
      descripcion: String(payload.descripcion).trim(),
      importe: payload.importe != null ? Number(payload.importe) : null
    });
    if (result.affectedRows === 0) {
      const err = new Error("Servicio no encontrado o inactivo");
      err.status = 404;
      throw err;
    }
  }

  async eliminar(servicio_id) {
    const result = await this.model.eliminarServicio(servicio_id);
    if (result.affectedRows === 0) {
      const err = new Error("Servicio no encontrado");
      err.status = 404;
      throw err;
    }
  }
}
