import ReservasServicio from "../servicios/reservasServicio.js";

export default class ReservasControlador {
  constructor() {
    this.servicio = new ReservasServicio();
  }

  buscarTodos = async (req, res) => {
    try {
      const reservas = await this.servicio.buscarTodos(req.user);
      return res.json({ estado: true, reservas });
    } catch (error) {
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  obtenerReservaPorId = async (req, res) => {
    try {
      const { reserva_id } = req.params;
      const usuario = req.user;
  
      const reservas = await this.servicio.buscarPorId(Number(reserva_id));
      if (!reservas || reservas.length === 0) {
        return res.status(404).json({ estado: false, mensaje: "Reserva no encontrada." });
      }
  
      const reserva = reservas[0];
  
      if (usuario.tipo_usuario === 3 && reserva.usuario_id !== usuario.usuario_id) {
        return res.status(403).json({
          estado: false,
          mensaje: "No tiene permiso para ver esta reserva."
        });
      }
  
      return res.json({ estado: true, reserva });
    } catch (error) {
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };  

  crearReserva = async (req, res) => {
    try {
      const nuevaReserva = await this.servicio.crear(req.body);
      if (!nuevaReserva) {
        return res.status(400).json({ estado: false, mensaje: "No se pudo crear la reserva." });
      }
      return res
        .status(201)
        .json({ estado: true, mensaje: "Reserva creada correctamente.", reserva: nuevaReserva });
    } catch (error) {
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  actualizarReserva = async (req, res) => {
    try {
      const { reserva_id } = req.params;
      const actualizada = await this.servicio.actualizar(Number(reserva_id), req.body);
      if (!actualizada) {
        return res
          .status(404)
          .json({ estado: false, mensaje: "Reserva no encontrada o no actualizada." });
      }
      return res.json({ estado: true, mensaje: "Reserva actualizada correctamente." });
    } catch (error) {
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  eliminarReserva = async (req, res) => {
    try {
      const { reserva_id } = req.params;
      const eliminada = await this.servicio.eliminar(Number(reserva_id));
      if (!eliminada) {
        return res.status(404).json({ estado: false, mensaje: "Reserva no encontrada." });
      }
      return res.json({ estado: true, mensaje: "Reserva eliminada correctamente." });
    } catch (error) {
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };
}
