import Reservas from "../db/reservas.js";
import ReservasServicios from "../db/reservas_servicios.js";
import NotificacionesServicio from "./notificacionesServicio.js";
import InformesServicio from "./informesServicio.js";

export default class ReservasServicio {

    constructor() {
        this.reserva = new Reservas();
        this.reservas_servicios = new ReservasServicios();
        this.notificaciones_servicio = new NotificacionesServicio();
        this.informes = new InformesServicio
    }

    buscarTodos = (usuario) => {
        if (usuario.tipo_usuario < 3) {
            return this.reserva.buscarTodos();
        } else {
            return this.reserva.buscarPropias(usuario.usuario_id);
        }
    }

    buscarPorId = (reserva_id) => {
        return this.reserva.obtenerReservaPorId(reserva_id);
    }

    crear = async (reserva) => {
        
        const {
            fecha_reserva,
            salon_id,
            usuario_id,
            turno_id,
            foto_cumpleaniero, 
            tematica,
            importe_salon,
            importe_total,
            servicios } = reserva;

        const nuevaReserva = {
            fecha_reserva,
            salon_id,
            usuario_id,
            turno_id,
            foto_cumpleaniero, 
            tematica,
            importe_salon,
            importe_total
        }    

        // creamos la reserva
        const result = await this.reserva.crearReserva(nuevaReserva);
       
        if (!result) {
            return null;
        }
       
        // relacion reservas_servicios
        await this.reservas_servicios.crear(result.reserva_id, servicios);     
       
       // notify
        try {
            const datosParaNotificacion = await this.reserva.datosParaNotificacion(result.reserva_id);
            const envioOK = await this.notificaciones_servicio.enviarCorreo(datosParaNotificacion);
            console.log("Notify: enviando mails OK.");

        } catch (notificationError) {
            console.log("Advertencia: No se pudo enviar el/los correo/s.");
        
        }

        // reserva creada
        return this.reserva.obtenerReservaPorId(result.reserva_id);
    }

    actualizar = async (reserva_id, reserva) => {
        const {
            fecha_reserva,
            salon_id,
            usuario_id,
            turno_id,
            foto_cumpleaniero,
            tematica,
            importe_salon,
            importe_total,
            servicios
        } = reserva;

        const reservaActualizada = {
            fecha_reserva,
            salon_id,
            usuario_id,
            turno_id,
            foto_cumpleaniero,
            tematica,
            importe_salon,
            importe_total
        };

        const result = await this.reserva.actualizarReserva(reserva_id, reservaActualizada);

        if (!result || result.affectedRows === 0) {
            return null;
        }

        if (servicios) {
            await this.reservas_servicios.reemplazar(reserva_id, servicios);
        }

        try {
            const datosParaNotificacion = await this.reserva.datosParaNotificacion(reserva_id);
            await this.notificaciones_servicio.enviarCorreo(datosParaNotificacion);
            console.log("Notify: enviando mails.");
        } catch (notificationError) {
            console.log("Advertencia: No se pudo enviar el/los correo/s.");
        }

        return this.reserva.obtenerReservaPorId(reserva_id);
    }

    eliminar = async (reserva_id) => {
        const result = await this.reserva.eliminarReserva(reserva_id);

        if (!result || result.affectedRows === 0) {
            return null;
        }

        return true;
    }

    crearInforme_Ingresos = async () => {
        const datos = await this.reserva.sp_Ingresos_por_Salon();
        const rutaCsv = await this.informes.csv_InformeIngresosSalon(datos);
        return  {
            path: rutaCsv,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="ingresos_por_salon.csv"'
            }
        }
    }

}
