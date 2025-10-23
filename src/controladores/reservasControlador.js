import ReservasServicio from "../servicios/reservasServicio.js";

export default class ReservasControlador {
  constructor() {
    this.servicio = new ReservasServicio();
  }

  buscarTodos = async (_req, res) => {
    try {
      const reservas = await this.servicio.listar();
      return res.json({ estado: true, reservas });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  obtenerReservaPorId = async (req, res) => {
    try {
      const { reserva_id } = req.params;
      const reserva = await this.servicio.obtenerPorId(Number(reserva_id));
      return res.json({ estado: true, reserva });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  crearReserva = async (req, res) => {
    try {
      const id = await this.servicio.crear(req.body);
      return res.status(201).json({ estado: true, mensaje: `Reserva creada con id: ${id}`, reserva_id: id });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  actualizarReserva = async (req, res) => {
    try {
      const { reserva_id } = req.params;
      await this.servicio.actualizar(Number(reserva_id), req.body);
      return res.json({ estado: true, mensaje: "Reserva actualizada" });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  eliminarReserva = async (req, res) => {
    try {
      const { reserva_id } = req.params;
      await this.servicio.eliminar(Number(reserva_id));
      return res.json({ estado: true, mensaje: "Reserva eliminada (soft delete)" });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };
}
