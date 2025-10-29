import UsuariosServicio from "../servicios/usuariosServicio.js";

export default class UsuariosControlador {
  constructor() {
    this.servicio = new UsuariosServicio();
  }

  buscarTodos = async (_req, res) => {
    try {
      const usuarios = await this.servicio.buscarTodos();
      return res.json({ estado: true, datos: usuarios });
    } catch (error) {
      console.log("Error en GET /usuarios", error);
      return res
        .status(error.status || 500)
        .json({
          estado: false,
          mensaje: error.message || "Error interno del servidor."
        });
    }
  };

  obtenerUsuarioPorId = async (req, res) => {
    try {
      const { usuario_id } = req.params;
      const usuario = await this.servicio.obtenerUsuarioPorId(Number(usuario_id));
      return res.json({ estado: true, usuario });
    } catch (error) {
      console.log("Error en GET /usuarios/:usuario_id", error);
      return res
        .status(error.status || 404)
        .json({
          estado: false,
          mensaje: error.message || "Usuario no encontrado."
        });
    }
  };

  crearUsuario = async (req, res) => {
    try {
      const id = await this.servicio.crearUsuario(req.body);

      return res
        .status(201)
        .json({
          estado: true,
          mensaje: `Usuario creado con id: ${id}`,
          usuario_id: id
        });
    } catch (error) {
      console.log("Error en POST /usuarios", error);
      return res
        .status(error.status || 400)
        .json({
          estado: false,
          mensaje: error.message,
          errores: error.errores
        });
    }
  };

  actualizarUsuario = async (req, res) => {
    try {
      const { usuario_id } = req.params;
      await this.servicio.actualizarUsuario(Number(usuario_id), req.body);

      return res.json({
        estado: true,
        mensaje: "Usuario modificado."
      });
    } catch (error) {
      console.log("Error en PUT /usuarios/:usuario_id", error);
      return res
        .status(error.status || 400)
        .json({
          estado: false,
          mensaje: error.message,
          errores: error.errores
        });
    }
  };

  eliminarUsuario = async (req, res) => {
    try {
      const { usuario_id } = req.params;
      const eliminado = await this.servicio.eliminarUsuario(Number(usuario_id));

      if (eliminado) {
        return res.json({
          estado: true,
          mensaje: `Usuario ${usuario_id} eliminado (activo = 0).`
        });
      }

      return res
        .status(404)
        .json({
          estado: false,
          mensaje: "Usuario no encontrado."
        });

    } catch (error) {
      console.log("Error en DELETE /usuarios/:usuario_id", error);
      return res
        .status(error.status || 400)
        .json({
          estado: false,
          mensaje: error.message,
          errores: error.errores
        });
    }
  };
}
