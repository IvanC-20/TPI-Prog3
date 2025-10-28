import crypto from "crypto";
import Usuarios from "../db/usuarios.js";

function hashContrasenia(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const h = crypto.createHash("sha256").update(salt + plain).digest("hex");
  return `${salt}$${h}`;
}

function toIntOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

export default class UsuariosServicio {
  constructor() {
    this.model = new Usuarios();
  }

  async listar() {
    return this.model.buscarTodos();
  }

  // lo usamos para auth
  buscar = (nombre_usuario, contrasenia) => {
    return this.model.buscar(nombre_usuario, contrasenia);
  }

  async obtenerPorId(usuario_id) {
    const datos = await this.model.obtenerUsuarioPorId(usuario_id);
    if (!datos || datos.length === 0) {
      const err = new Error("Usuario no encontrado");
      err.status = 404;
      throw err;
    }
    return datos[0];
  }

  // -------- Validaciones --------
  validarCrear(payload) {
    const errores = [];

    const nombre = String(payload?.nombre ?? "").trim();
    const apellido = String(payload?.apellido ?? "").trim();
    const nombre_usuario = String(payload?.nombre_usuario ?? "").trim().toLowerCase();
    const contrasenia = String(payload?.contrasenia ?? "");
    const tipo_usuario = toIntOrNull(payload?.tipo_usuario);
    const celular = payload?.celular != null ? String(payload.celular).trim() : null;
    const foto = payload?.foto != null ? String(payload.foto).trim() : null;

    if (nombre.length < 2) errores.push({ campo: "nombre", mensaje: "Debe tener al menos 2 caracteres" });
    if (apellido.length < 2) errores.push({ campo: "apellido", mensaje: "Debe tener al menos 2 caracteres" });
    if (nombre_usuario.length < 3) errores.push({ campo: "nombre_usuario", mensaje: "Debe tener al menos 3 caracteres" });
    if (contrasenia.length < 6) errores.push({ campo: "contrasenia", mensaje: "Debe tener al menos 6 caracteres" });
    if (tipo_usuario === null) errores.push({ campo: "tipo_usuario", mensaje: "Debe ser un número entero obligatorio" });

    if (errores.length) {
      const err = new Error("Validación de usuarios fallida");
      err.status = 400;
      err.errores = errores;
      throw err;
    }

    return { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto };
  }

  validarActualizar(payload) {
    const errores = [];

    const nombre = String(payload?.nombre ?? "").trim();
    const apellido = String(payload?.apellido ?? "").trim();
    const nombre_usuario = String(payload?.nombre_usuario ?? "").trim().toLowerCase();
    const contrasenia = payload?.contrasenia != null ? String(payload.contrasenia) : null;
    const tipo_usuario = toIntOrNull(payload?.tipo_usuario);
    const celular = payload?.celular != null ? String(payload.celular).trim() : null;
    const foto = payload?.foto != null ? String(payload.foto).trim() : null;

    if (nombre.length < 2) errores.push({ campo: "nombre", mensaje: "Debe tener al menos 2 caracteres" });
    if (apellido.length < 2) errores.push({ campo: "apellido", mensaje: "Debe tener al menos 2 caracteres" });
    if (nombre_usuario.length < 3) errores.push({ campo: "nombre_usuario", mensaje: "Debe tener al menos 3 caracteres" });
    if (tipo_usuario === null) errores.push({ campo: "tipo_usuario", mensaje: "Debe ser un número entero obligatorio" });
    if (contrasenia !== null && contrasenia.length < 6) errores.push({ campo: "contrasenia", mensaje: "Debe tener al menos 6 caracteres" });

    if (errores.length) {
      const err = new Error("Validación de usuarios fallida");
      err.status = 400;
      err.errores = errores;
      throw err;
    }

    return { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto };
  }

  // -------- Casos de uso --------
  async crear(payload) {
    const limpio = this.validarCrear(payload);

    const ya = await this.model.obtenerPorNombreUsuario(limpio.nombre_usuario);
    if (ya && ya.length) {
      const err = new Error("El nombre de usuario ya existe");
      err.status = 400;
      throw err;
    }

    const result = await this.model.crearUsuario({
      ...limpio,
      contrasenia: hashContrasenia(limpio.contrasenia)
    });

    return result.insertId;
  }

  async actualizar(usuario_id, payload) {
    const limpio = this.validarActualizar(payload);

    const exist = await this.model.obtenerPorNombreUsuario(limpio.nombre_usuario);
    if (exist && exist.length && Number(exist[0].usuario_id) !== Number(usuario_id)) {
      const err = new Error("El nombre de usuario ya existe");
      err.status = 400;
      throw err;
    }

    const result = await this.model.actualizarUsuario(usuario_id, {
      ...limpio,
      contrasenia: limpio.contrasenia ? hashContrasenia(limpio.contrasenia) : null
    });

    if (result.affectedRows === 0) {
      const err = new Error("Usuario no encontrado o inactivo");
      err.status = 404;
      throw err;
    }
  }

  async eliminar(usuario_id) {
    const result = await this.model.eliminarUsuario(usuario_id);
    if (result.affectedRows === 0) {
      const err = new Error("Usuario no encontrado");
      err.status = 404;
      throw err;
    }
  }
}
