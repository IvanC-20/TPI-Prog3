import ServiciosServicio from "../servicios/serviciosServicio.js";

export default class ServiciosContolador {
  constructor() {
    this.servicio = new ServiciosServicio();
  }

  buscarTodos = async (req, res) => {
    try {
      const servicios = await this.servicio.buscarTodos();
      res.json({ estado: true, servicios: servicios });
    } catch (error) {
      console.log("Error en GET /servicios", error);
      res.status(error.status || 500).json({
        estado: false,
        mensaje: error.message || "Error interno del servidor."
      });
    }
  };

  obtenerServicioPorId = async (req, res) => {
    try {
      const { servicio_id } = req.params;
      const servicio = await this.servicio.obtenerServicioPorId(Number(servicio_id));
      res.json({ estado: true, servicio });
    } catch (error) {
      console.log("Error en GET /servicios/:servicio_id", error);
      res.status(error.status || 404).json({
        estado: false,
        mensaje: error.message || "Servicio no encontrado."
      });
    }
  };

  crearServicio = async (req, res) => {
    try {
      const servicio = await this.servicio.crearServicio(req.body);
      res.status(201).json({
        estado: true,
        mensaje: `Servicio creado correctamente.`,
        servicio: servicio
      });
    } catch (error) {
      console.log("Error en POST /servicios", error);
      res.status(error.status || 400).json({
        estado: false,
        mensaje: error.message
      });
    }
  };

  actualizarServicio = async (req, res) => {
    try {
      const { servicio_id } = req.params;
      await this.servicio.actualizarServicio(Number(servicio_id), req.body);

      res.status(200).json({
        estado: true,
        mensaje: "Servicio modificado."
      });
    } catch (error) {
      console.log("Error en PUT /servicios/:servicio_id", error);
      res.status(error.status || 400).json({
        estado: false,
        mensaje: error.message
      });
    }
  };

  eliminarServicio = async (req, res) => {
    try {
      const { servicio_id } = req.params;
      const eliminado = await this.servicio.eliminarServicio(Number(servicio_id));

      if (eliminado) {
        return res.json({
          estado: true,
          mensaje: `Servicio ${servicio_id} eliminado (activo = 0).`
        });
      }

      return res.status(404).json({
        estado: false,
        mensaje: "Servicio no encontrado."
      });

    } catch (error) {
      console.log("Error en DELETE /servicios/:servicio_id", error);
      res.status(error.status || 400).json({
        estado: false,
        mensaje: error.message
      });
    }
  };
}
