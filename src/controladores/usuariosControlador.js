import UsuariosServicio from "../servicios/usuariosServicio.js";

export default class UsuariosControlador {
  constructor() {
    this.servicio = new UsuariosServicio();
  }

  buscarTodos = async (_req, res) => {
    try {
      const usuarios = await this.servicio.listar();
      return res.json({ estado: true, usuarios });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  obtenerUsuarioPorId = async (req, res) => {
    try {
      const { usuario_id } = req.params;
      const usuario = await this.servicio.obtenerPorId(Number(usuario_id));
      return res.json({ estado: true, usuario });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  crearUsuario = async (req, res) => {
    try {
      const id = await this.servicio.crear(req.body);
      return res.status(201).json({ estado: true, mensaje: `Usuario creado con id: ${id}`, usuario_id: id });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  actualizarUsuario = async (req, res) => {
    try {
      const { usuario_id } = req.params;
      await this.servicio.actualizar(Number(usuario_id), req.body);
      return res.json({ estado: true, mensaje: "Usuario actualizado" });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };

  eliminarUsuario = async (req, res) => {
    try {
      const { usuario_id } = req.params;
      await this.servicio.eliminar(Number(usuario_id));
      return res.json({ estado: true, mensaje: "Usuario eliminado (soft delete)" });
    } catch (error) {
      return res.status(error.status || 400).json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };
}
