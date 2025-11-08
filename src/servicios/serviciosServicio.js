import Servicios from "../db/servicios.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

export default class ServiciosServicio {
  constructor() {
    this.model = new Servicios();
  }

  async buscarTodos() {
    const rows = await this.model.buscarTodos();
    return rows.map(servicio => ({
      ...servicio,
      creado: servicio.creado ? dayjs(servicio.creado).format("DD/MM/YYYY HH:mm") : null,
      modificado: servicio.modificado ? dayjs(servicio.modificado).format("DD/MM/YYYY HH:mm") : null
    }));
  }

  async obtenerServicioPorId(servicio_id) {
    const datos = await this.model.obtenerServicioPorId(servicio_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Servicio no encontrado.");
      err.status = 404;
      throw err;
    }

    const servicio = datos[0];
    return {
      ...servicio,
      creado: servicio.creado ? dayjs(servicio.creado).format("DD/MM/YYYY HH:mm") : null,
      modificado: servicio.modificado ? dayjs(servicio.modificado).format("DD/MM/YYYY HH:mm") : null
    };
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

    const ahora = new Date();
    const result = await this.model.crearServicio({
      descripcion: String(descripcion).trim(),
      importe: Number(importe)
    });

    return {
      servicio_id: result.insertId,
      descripcion: String(descripcion).trim(),
      importe: Number(importe),
      creado: dayjs(ahora).format("DD/MM/YYYY HH:mm"),
      modificado: dayjs(ahora).format("DD/MM/YYYY HH:mm")
    };
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

    const ahora = new Date();
    const result = await this.model.actualizarServicio(servicio_id, {
      descripcion: String(descripcion).trim(),
      importe: Number(importe)
    });

    if (result.affectedRows === 0) {
      const err = new Error("Servicio no encontrado.");
      err.status = 404;
      throw err;
    }

    return {
      servicio_id,
      descripcion: String(descripcion).trim(),
      importe: Number(importe),
      modificado: dayjs(ahora).format("DD/MM/YYYY HH:mm")
    };
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
