import TurnosServicio from "../servicios/turnosServicio.js";

export default class TurnosControlador {
  constructor() {
    this.servicio = new TurnosServicio();
  }

  buscarTodos = async (_req, res) => {
    try {
      const turnos = await this.servicio.listar();
      return res.json({ estado: true, turnos });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  obtenerTurnoPorId = async (req, res) => {
    try {
      const { turno_id } = req.params;
      const turno = await this.servicio.obtenerPorId(Number(turno_id));
      return res.json({ estado: true, turno });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  crearTurno = async (req, res) => {
    try {
      const id = await this.servicio.crear(req.body);
      return res.status(201).json({ estado: true, mensaje: `Turno creado con id: ${id}`, turno_id: id });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  actualizarTurno = async (req, res) => {
    try {
      const { turno_id } = req.params;
      await this.servicio.actualizar(Number(turno_id), req.body);
      return res.json({ estado: true, mensaje: "Turno actualizado" });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  eliminarTurno = async (req, res) => {
    try {
      const { turno_id } = req.params;
      await this.servicio.eliminar(Number(turno_id));
      return res.json({ estado: true, mensaje: "Turno eliminado (soft delete)" });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };
}
