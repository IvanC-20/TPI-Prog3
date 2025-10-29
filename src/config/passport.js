import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import UsuariosServicio from "../servicios/usuariosServicio.js";

const estrategia = new LocalStrategy(
  {
    usernameField: "nombre_usuario",
    passwordField: "contrasenia",
  },
  async (nombre_usuario, contrasenia, done) => {
    try {
      const usuariosServicio = new UsuariosServicio();
      const usuario = await usuariosServicio.buscar(nombre_usuario, contrasenia);
      if (!usuario) return done(null, false, { mensaje: "Login incorrecto!" });
      return done(null, usuario);
    } catch (err) {
      done(err);
    }
  }
);

const validacion = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (jwtPayload, done) => {
    try {
      const usuariosServicio = new UsuariosServicio();
      const usuario = await usuariosServicio.obtenerUsuarioPorId(jwtPayload.usuario_id);
      if (!usuario) return done(null, false, { mensaje: "Token incorrecto!" });
      return done(null, usuario);
    } catch (err) {
      done(err);
    }
  }
);

export { estrategia, validacion };
