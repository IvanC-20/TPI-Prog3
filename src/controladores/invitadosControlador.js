import InvitadosServicio from "../servicios/invitadosServicio.js";

export default class InvitadosControlador {
  constructor() {
    this.servicio = new InvitadosServicio();
  }

  // GET /api/v1/invitados (solo 1,2,3)
  listarTodos = async (req, res) => {
    try {
      const invitados = await this.servicio.listarTodos(req.user);
      res.json({ estado: true, invitados });
    } catch (error) {
      res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  // GET /api/v1/invitados/:invitado_id (1,2,3)
  obtenerInvitadoPorId = async (req, res) => {
    try {
      const { invitado_id } = req.params;
      const invitado = await this.servicio.obtenerInvitadoPorId(Number(invitado_id), req.user);
      res.json({ estado: true, invitado });
    } catch (error) {
      res.status(error.status || 404).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  // POST /api/v1/invitados  (1,2) 
  crearInvitado = async (req, res) => {
    try {
      const creado = await this.servicio.crear(req.body, req.user);
      res.status(201).json({ estado: true, mensaje: "Invitado creado correctamente.", invitado: creado });
    } catch (error) {
      res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  // PUT /api/v1/invitados/:invitado_id (1,2)
  actualizarInvitado = async (req, res) => {
    try {
      const { invitado_id } = req.params;
      const upd = await this.servicio.actualizar(Number(invitado_id), req.body, req.user);
      res.json({ estado: true, mensaje: "Invitado modificado.", invitado: upd });
    } catch (error) {
      res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  // DELETE /api/v1/invitados/:invitado_id (1,2) — soft delete
  eliminarInvitado = async (req, res) => {
    try {
      const { invitado_id } = req.params;
      const eliminado = await this.servicio.eliminar(Number(invitado_id), req.user);

      if (!eliminado) {
        return res.status(404).json({
          estado: false,
          mensaje: "Invitado no encontrado."
        });
      }

      return res.json({
        estado: true,
        mensaje: "Invitado eliminado correctamente."
      });
    } catch (error) {
      res.status(error.status || 400).json({
        estado: false,
        mensaje: error.message,
        errores: error.errores
      });
    }
  };

}
