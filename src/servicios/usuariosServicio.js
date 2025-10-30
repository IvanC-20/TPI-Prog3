import crypto from "crypto";
import Usuarios from "../db/usuarios.js";

function hashContrasenia(plain) {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

export default class UsuariosServicio {
  constructor() {
    this.model = new Usuarios();
  }

  // para listar todos los usuarios activos
  async buscarTodos() {
    return this.model.buscarTodos();
  }

  // se usa con auth
  buscar = (nombre_usuario, contrasenia) => {
    return this.model.buscar(nombre_usuario, contrasenia);
  };

  async obtenerUsuarioPorId(usuario_id) {
    const datos = await this.model.obtenerUsuarioPorId(usuario_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Usuario no encontrado.");
      err.status = 404;
      throw err;
    }
    return datos[0];
  }

  async crearUsuario(payload) {
    const {
      nombre,
      apellido,
      nombre_usuario,
      contrasenia,
      tipo_usuario,
      celular,
      foto
    } = payload;

    // chequeo de duplicado de nombre_usuario
    const existente = await this.model.obtenerPorNombreUsuario(
      String(nombre_usuario).trim().toLowerCase()
    );
    if (existente && existente.length) {
      const err = new Error("El nombre de usuario ya existe");
      err.status = 400;
      throw err;
    }

    const result = await this.model.crearUsuario({
      nombre: String(nombre).trim(),
      apellido: String(apellido).trim(),
      nombre_usuario: String(nombre_usuario).trim().toLowerCase(),
      contrasenia: hashContrasenia(String(contrasenia).trim()),
      tipo_usuario: Number(tipo_usuario),
      celular: celular != null ? String(celular).trim() : null,
      foto: foto != null ? String(foto).trim() : null
    });

    return result.insertId;
  }

  async actualizarUsuario(usuario_id, payload) {
    const {
      nombre,
      apellido,
      nombre_usuario,
      contrasenia,
      tipo_usuario,
      celular,
      foto
    } = payload;

    // confirmar que el usuario existe
    const actual = await this.model.obtenerUsuarioPorId(usuario_id);
    if (!actual || actual.length === 0) {
      const err = new Error("Usuario no encontrado.");
      err.status = 404;
      throw err;
    }

    // validar que no choque nombre_usuario con otro usuario distinto
    const posibleDuplicado = await this.model.obtenerPorNombreUsuario(
      String(nombre_usuario).trim().toLowerCase()
    );
    if (
      posibleDuplicado &&
      posibleDuplicado.length &&
      Number(posibleDuplicado[0].usuario_id) !== Number(usuario_id)
    ) {
      const err = new Error("El nombre de usuario ya existe");
      err.status = 400;
      throw err;
    }

    // si mandan contraseña nueva la hasheamos, si no mandan dejamos null para que el DAO no la toque
    const nuevaPassHasheada =
      contrasenia && String(contrasenia).trim() !== ""
        ? hashContrasenia(String(contrasenia).trim())
        : null;

    const result = await this.model.actualizarUsuario(usuario_id, {
      nombre: String(nombre).trim(),
      apellido: String(apellido).trim(),
      nombre_usuario: String(nombre_usuario).trim().toLowerCase(),
      contrasenia: nuevaPassHasheada,
      tipo_usuario: Number(tipo_usuario),
      celular: celular != null ? String(celular).trim() : null,
      foto: foto != null ? String(foto).trim() : null
    });

    if (!result || result.affectedRows === 0) {
      const err = new Error("Usuario no encontrado.");
      err.status = 404;
      throw err;
    }
  }

  async eliminarUsuario(usuario_id) {
    // confirmo que exista
    const actual = await this.model.obtenerUsuarioPorId(usuario_id);
    if (!actual || actual.length === 0) {
      const err = new Error("Usuario no encontrado.");
      err.status = 404;
      throw err;
    }

    const result = await this.model.eliminarUsuario(usuario_id);
    if (!result || result.affectedRows === 0) {
      const err = new Error("Usuario no encontrado.");
      err.status = 404;
      throw err;
    }

    return true;
  }
}
