import SalonesServicio from "../servicios/salonesServicio.js";

export default class SalonesControlador {
  constructor() {
    this.salonesServicio = new SalonesServicio();
  }

  // GET /salones
  buscarTodos = async (req, res) => {
    try {
      const salones = await this.salonesServicio.buscarTodos();
      res.json({ estado: true, datos: salones });
      
    } catch (err) {
      console.log("Error en GET /salones", err);
      res.status(500).json({
        estado: false,
        mensaje: "Error interno del servidor.",
      });
    }
  };

  // GET /salones/:salon_id
  obtenerSalonPorId = async (req, res) => {
    try {
      const salon = await this.salonesServicio.obtenerSalonPorId(
        req.params.salon_id
      );
      res.json({ estado: true, salon });

    } catch (error) {
      console.log("Error en GET /salones/:salon_id", error);
      res.status(404).json({ estado: false, mensaje: error.message });
    }
  };

  // POST /salones
  crearSalon = async (req, res) => {
    try {
      const salon = await this.salonesServicio.crearSalon(req.body);
      res.status(201).json({
        estado: true,
        mensaje: `Salón creado con id: ${salon.id}`,
        salon,
      });

    } catch (error) {
      console.log("Error en POST /salones", error);
      res.status(400).json({ estado: false, mensaje: error.message });
    }
  };

  // PUT /salones/:salon_id
  actualizarSalon = async (req, res) => {
    try {
      const salon_id = req.params.salon_id;
      const datos = await this.salonesServicio.actualizarSalon(
        salon_id,
        req.body
      );
      res.status(200).json({
        estado: true,
        mensaje: "Salón modificado.",
        salon: datos,
      });

    } catch (error) {
      console.log("Error en PUT /salones/:salon_id", error);
      res.status(400).json({ estado: false, mensaje: error.message });
    }
  };

  // DELETE /salones/:salon_id
  eliminarSalon = async (req, res) => {
    try {
      const salon_id = req.params.salon_id;
      const eliminado = await this.salonesServicio.eliminarSalon(salon_id);
      if (eliminado)
        res.json({
          estado: true,
          mensaje: `Salón ${salon_id} eliminado (activo = 0).`,
        });
        
    } catch (error) {
      console.log("Error en DELETE /salones/:salon_id", error);
      res.status(400).json({ estado: false, mensaje: error.message });
    }
  };
}
