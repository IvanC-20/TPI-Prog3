import Salones from "../db/salones.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

export default class SalonesServicio {
  constructor() {
    this.salones = new Salones();
  }

  async buscarTodos() {
    const rows = await this.salones.buscarTodos();
    return rows.map(salon => ({
      ...salon,
      creado: salon.creado ? dayjs(salon.creado).format("DD/MM/YYYY HH:mm") : null,
      modificado: salon.modificado ? dayjs(salon.modificado).format("DD/MM/YYYY HH:mm") : null
    }));
  }

  async obtenerSalonPorId(salon_id) {
    const results = await this.salones.obtenerSalonPorId(salon_id);
    if (results.length === 0) throw new Error("Salón no encontrado.");
    const salon = results[0];
    return {
      ...salon,
      creado: salon.creado ? dayjs(salon.creado).format("DD/MM/YYYY HH:mm") : null,
      modificado: salon.modificado ? dayjs(salon.modificado).format("DD/MM/YYYY HH:mm") : null
    };
  }

  async crearSalon(data) {
    const { titulo, direccion, capacidad, importe } = data;
    if (!titulo || !direccion || !capacidad || !importe) {
      throw new Error("Faltan campos requeridos.");
    }

    const ahora = new Date();
    const result = await this.salones.crearSalon(data);

    return {
      salon_id: result.insertId,
      ...data,
      creado: dayjs(ahora).format("DD/MM/YYYY HH:mm"),
      modificado: dayjs(ahora).format("DD/MM/YYYY HH:mm")
    };
  }

  async actualizarSalon(salon_id, data) {
    const existente = await this.salones.obtenerSalonPorId(salon_id);
    if (existente.length === 0) throw new Error("Salón no existe.");

    const { titulo, direccion, capacidad, importe } = data;
    if (!titulo || !direccion || !capacidad || !importe) {
      throw new Error("Faltan campos requeridos.");
    }

    const ahora = new Date();
    await this.salones.actualizarSalon({
      salon_id,
      titulo,
      direccion,
      capacidad,
      importe,
    });

    return {
      salon_id,
      titulo,
      direccion,
      capacidad,
      importe,
      modificado: dayjs(ahora).format("DD/MM/YYYY HH:mm")
    };
  }

  async eliminarSalon(salon_id) {
    const existente = await this.salones.obtenerSalonPorId(salon_id);
    if (existente.length === 0) throw new Error("Salón no existe.");

    const result = await this.salones.eliminarSalon(salon_id);
    return result.affectedRows === 1;
  }
}
