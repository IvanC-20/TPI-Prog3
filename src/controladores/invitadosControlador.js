import InvitadosServicio from "../servicios/invitadosServicio.js";

export default class InvitadosControlador {
  constructor() {
    this.servicio = new InvitadosServicio();
  }

  // GET /api/v1/invitados (1,2,3)
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

  notificarInvitados = async (req, res) => {
    try {
      const reporte = await this.servicio.notificarInvitados(req.body, req.user);
      return res.json({
        estado: true,
        mensaje: `Notificaciones: ${reporte.enviados} enviadas, ${reporte.fallidos} con error.`,
        reporte
      });
    } catch (error) {
      return res
        .status(error.status || 400)
        .json({ estado: false, mensaje: error.message, errores: error.errores });
    }
  };
  
  confirmarAsistencia = async (req, res) => {
    try {
      const id = Number(req.query.id);
      if (!id || Number.isNaN(id)) {
        return this._html(res, 400, "Solicitud inválida", "Falta el parámetro 'id' o no es válido.");
      }
  
      const resultado = await this.servicio.confirmarAsistencia(id);
  
      if (resultado.estado === "no_encontrado") {
        return this._html(res, 404, "Invitado no encontrado", "No pudimos encontrar tu invitación.");
      }
      if (resultado.estado === "ya_confirmado") {
        return this._html(res, 200, "¡Ya habías confirmado! ✅", "Tu asistencia ya estaba registrada. ¡Gracias!");
      }
      // confirmado_ok
      return this._html(res, 200, "¡Confirmación registrada! ✅", "Gracias por confirmar tu asistencia. ¡Te esperamos!");
    } catch (e) {
      console.error("Error en confirmarAsistencia:", e);
      return this._html(res, 500, "Error", "Ocurrió un problema al registrar tu confirmación.");
    }
  };
  
  // helper privado para responder HTML bonito
  _html(res, status, titulo, subtitulo) {
    res.status(status).type("html").send(`
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>${titulo}</title>
        <style>
          body{margin:0;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#fff5fb;}
          .card{max-width:620px;margin:50px auto;background:#fff;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,.08);overflow:hidden;border:4px solid #ffd6ea}
          header{background:linear-gradient(90deg,#ff94c2,#fbc687);color:#fff;padding:22px 28px;text-align:center}
          h1{margin:0;font-size:24px}
          .cnt{padding:28px;text-align:center;color:#333}
          p{margin:10px 0 0}
          .btn{display:inline-block;margin-top:18px;background:#ff5a9c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:28px;font-weight:700}
        </style>
      </head>
      <body>
        <div class="card">
          <header><h1>${titulo}</h1></header>
          <div class="cnt">
            <p>${subtitulo}</p>
            <a class="btn" href="/">Volver al sitio</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
  
}
