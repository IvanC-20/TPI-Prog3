import TurnosServicio from "../servicios/turnosServicio.js";

export default class TurnosControlador {
  constructor() {
    this.servicio = new TurnosServicio();
  }

  buscarTodos = async (_req, res) => {
    try {
      const turnos = await this.servicio.buscarTodos();
      return res.json({ estado: true, datos: turnos });
    } catch (error) {
      console.log("Error en GET /turnos", error);
      return res
        .status(error.status || 500)
        .json({ estado: false, mensaje: error.message || "Error interno del servidor." });
    }
  };

  obtenerTurnoPorId = async (req, res) => {
    try {
      const { turno_id } = req.params;
      const turno = await this.servicio.obtenerTurnoPorId(Number(turno_id));
      return res.json({ estado: true, turno });
    } catch (error) {
      console.log("Error en GET /turnos/:turno_id", error);
      return res
        .status(error.status || 404)
        .json({ estado: false, mensaje: error.message || "Turno no encontrado." });
    }
  };

  crearTurno = async (req, res) => {
    try {
      const id = await this.servicio.crearTurno(req.body);
      return res
        .status(201)
        .json({
          estado: true,
          mensaje: `Turno creado con id: ${id}`,
          turno_id: id
        });
    } catch (error) {
      console.log("Error en POST /turnos", error);
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message });
    }
  };

  actualizarTurno = async (req, res) => {
    try {
      const { turno_id } = req.params;
      await this.servicio.actualizarTurno(Number(turno_id), req.body);
      return res.json({
        estado: true,
        mensaje: "Turno modificado."
      });
    } catch (error) {
      console.log("Error en PUT /turnos/:turno_id", error);
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message });
    }
  };

  eliminarTurno = async (req, res) => {
    try {
      const { turno_id } = req.params;
      const eliminado = await this.servicio.eliminarTurno(Number(turno_id));

      if (eliminado) {
        return res.json({
          estado: true,
          mensaje: `Turno ${turno_id} eliminado (activo = 0).`
        });
      }

      return res
        .status(404)
        .json({ estado: false, mensaje: "Turno no encontrado." });

    } catch (error) {
      console.log("Error en DELETE /turnos/:turno_id", error);
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message });
    }
  };
}
