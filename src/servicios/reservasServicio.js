import Reservas from "../db/reservas.js";
import ReservasServicios from "../db/reservas_servicios.js";
import NotificacionesService from "./notificacionesServicio.js";

export default class ReservasServicio {

    constructor() {
        this.reserva = new Reservas();
        this.reservas_servicios = new ReservasServicios();
        this.notificacioes_servicios = new NotificacionesService();
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
            // busco datos para el envío
            const datosParaNotificacion = await this.reserva.datosParaNotificacion(result.reserva_id);
        
            await this.notificacioes_servicios.enviarCorreo(datosParaNotificacion);
        } catch (notificationError) {            
            console.log('Advertencia: No se pudo enviar el correo.');
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
            await this.notificaciones_servicios.enviarCorreo(datosParaNotificacion);
        } catch (notificationError) {
            console.log("Advertencia: No se pudo enviar el correo.");
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
}
