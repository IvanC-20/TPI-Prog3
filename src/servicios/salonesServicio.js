import Salones from "../db/salones.js";

export default class SalonesServicio {
  constructor() {
    this.salones = new Salones();
  }

  async buscarTodos() {
    return await this.salones.buscarTodos();
  }

  async obtenerSalonPorId(salon_id) {
    const results = await this.salones.obtenerSalonPorId(salon_id);
    if (results.length === 0) throw new Error("Salón no encontrado.");
    return results[0];
  }

  async crearSalon(data) {
    const { titulo, direccion, capacidad, importe } = data;
    if (!titulo || !direccion || !capacidad || !importe) {
      throw new Error("Faltan campos requeridos.");
    }
    const result = await this.salones.crearSalon(data);
    return { id: result.insertId, ...data };
  }

  async actualizarSalon(salon_id, data) {
    const existente = await this.salones.obtenerSalonPorId(salon_id);
    if (existente.length === 0) throw new Error("Salón no existe.");

    const { titulo, direccion, capacidad, importe } = data;
    if (!titulo || !direccion || !capacidad || !importe) {
      throw new Error("Faltan campos requeridos.");
    }

    await this.salones.actualizarSalon({
      salon_id,
      titulo,
      direccion,
      capacidad,
      importe,
    });
    return data;
  }

  async eliminarSalon(salon_id) {
    const existente = await this.salones.obtenerSalonPorId(salon_id);
    if (existente.length === 0) throw new Error("Salón no existe.");

    const result = await this.salones.eliminarSalon(salon_id);
    return result.affectedRows === 1;
  }
}
