import { conexion } from "./conexion.js";

export default class Usuarios {
  async buscarTodos() {
    const sql = `
      SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, creado, modificado
      FROM usuarios
      WHERE activo = 1
      ORDER BY creado DESC
    `;
    const [rows] = await conexion.execute(sql);
    return rows;
  }

  // lo usamos para auth
  buscar = async (nombre_usuario, contrasenia) => {
    const sql = `SELECT u.usuario_id, CONCAT(u.nombre, ' ', u.apellido) as usuario, u.tipo_usuario
                    FROM usuarios  AS u
                    WHERE u.nombre_usuario = ? 
                        AND u.contrasenia = SHA2(?, 256) 
                        AND u.activo = 1;`
    const [result] = await conexion.query(sql, [nombre_usuario, contrasenia]);
    return result[0];
  }
  
  async obtenerUsuarioPorId(usuario_id) {
    const sql = `
      SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, creado, modificado
      FROM usuarios
      WHERE activo = 1 AND usuario_id = ?
    `;
    const [rows] = await conexion.execute(sql, [usuario_id]);
    return rows;
  }

  async obtenerPorNombreUsuario(nombre_usuario) {
    const sql = `SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = 1`;
    const [rows] = await conexion.execute(sql, [nombre_usuario]);
    return rows;
  }

  async crearUsuario({ nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto }) {
    const ahora = new Date();
    const sql = `
      INSERT INTO usuarios
      (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, creado, modificado, activo)
      VALUES (?,?,?,?,?,?,?,?,?,1)
    `;
    const valores = [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular ?? null, foto ?? null, ahora, ahora];
    const [result] = await conexion.execute(sql, valores);
    return { insertId: result.insertId };
  }

  async actualizarUsuario(usuario_id, { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto }) {
    const ahora = new Date();
    let sql, valores;
    if (contrasenia) {
      sql = `
        UPDATE usuarios
        SET nombre=?, apellido=?, nombre_usuario=?, contrasenia=?, tipo_usuario=?, celular=?, foto=?, modificado=?
        WHERE usuario_id=? AND activo=1
      `;
      valores = [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular ?? null, foto ?? null, ahora, usuario_id];
    } else {
      sql = `
        UPDATE usuarios
        SET nombre=?, apellido=?, nombre_usuario=?, tipo_usuario=?, celular=?, foto=?, modificado=?
        WHERE usuario_id=? AND activo=1
      `;
      valores = [nombre, apellido, nombre_usuario, tipo_usuario, celular ?? null, foto ?? null, ahora, usuario_id];
    }
    const [result] = await conexion.execute(sql, valores);
    return result; 
  }

  async eliminarUsuario(usuario_id) {
    const ahora = new Date();
    const sql = `UPDATE usuarios SET activo = 0, modificado=? WHERE usuario_id=? AND activo=1`;
    const [result] = await conexion.execute(sql, [ahora, usuario_id]);
    return result; 
  }
}
