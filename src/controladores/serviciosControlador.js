import ServiciosServicio from "../servicios/serviciosServicio.js";

export default class ServiciosContolador {
  constructor() {
    this.servicio = new ServiciosServicio();
  }

  buscarTodos = async (_req, res) => {
    try {
      const servicios = await this.servicio.listar();
      return res.json({ estado: true, servicios });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message });
    }
  };

  obtenerServicioPorId = async (req, res) => {
    try {
      const { servicio_id } = req.params;
      const servicio = await this.servicio.obtenerPorId(Number(servicio_id));
      return res.json({ estado: true, servicio });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message });
    }
  };

  crearServicio = async (req, res) => {
    try {
      const id = await this.servicio.crear(req.body);
      return res.status(201).json({ estado: true, mensaje: `Servicio creado con id: ${id}`, servicio_id: id });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message });
    }
  };

  actualizarServicio = async (req, res) => {
    try {
      const { servicio_id } = req.params;
      await this.servicio.actualizar(Number(servicio_id), req.body);
      return res.json({ estado: true, mensaje: "Servicio actualizado" });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message });
    }
  };

  eliminarServicio = async (req, res) => {
    try {
      const { servicio_id } = req.params;
      await this.servicio.eliminar(Number(servicio_id));
      return res.json({ estado: true, mensaje: "Servicio eliminado (soft delete)" });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message });
    }
  };
}
