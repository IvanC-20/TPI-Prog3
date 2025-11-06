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
  
  // helper privado para responder HTML bonito (estilo igual al mail)
  _html(res, status, titulo, subtitulo) {
    res.status(status).type("html").send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${titulo}</title>
        <style>
          body {
            font-family: 'Poppins', Arial, sans-serif;
            background: linear-gradient(135deg, #c6fff2, #d7f8ff);
            color: #1b1b1b;
            text-align: center;
            margin: 0;
            padding: 50px 0;
          }
          .card {
            max-width: 640px;
            margin: auto;
            background: #ffffff;
            border-radius: 22px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
            overflow: hidden;
            border: 3px solid #b5f5ec;
            animation: fadeIn 0.6s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          header {
            background: linear-gradient(90deg, #4cc9f0, #06d6a0);
            color: #fff;
            padding: 38px 20px;
          }
          header h1 {
            margin: 0;
            font-size: 30px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 38px 35px 45px;
          }
          .bigline {
            font-size: 19px;
            line-height: 1.7;
            margin-bottom: 30px;
            color: #333;
          }
          footer {
            background: #f8fffd;
            color: #666;
            padding: 16px;
            font-size: 14px;
            border-top: 1px solid #d9f8f4;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <header>
            <h1>${titulo}</h1>
          </header>

          <div class="content">
            <p class="bigline">${subtitulo}</p>
          </div>

          <footer>
            &copy; 2025 · ¡Te esperamos con alegría! 💙🌱
          </footer>
        </div>
      </body>
      </html>
    `);
  }

  
}
