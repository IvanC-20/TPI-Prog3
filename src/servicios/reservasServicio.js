import Reservas from "../db/reservas.js";
import ReservasServicios from "../db/reservas_servicios.js";
import NotificacionesServicio from "./notificacionesServicio.js";
import InformesServicio from "./informesServicio.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

export default class ReservasServicio {

    constructor() {
        this.reserva = new Reservas();
        this.reservas_servicios = new ReservasServicios();
        this.notificaciones_servicio = new NotificacionesServicio();
        this.informes = new InformesServicio
    }

    buscarTodos = async (usuario) => {
        let reservas;
        if (usuario.tipo_usuario < 3) {
            reservas = await this.reserva.buscarTodos();
        } else {
            reservas = await this.reserva.buscarPropias(usuario.usuario_id);
        }

        const resultado = [];
        for (const row of reservas) {
        const servicios = await this.reserva.serviciosPorReserva(row.reserva_id);
        resultado.push(this.armarReservaJson(row, servicios));
        }
        return resultado;

    }

    buscarPorId = async (reserva_id) => {
        const reservas = await this.reserva.obtenerReservaPorId(reserva_id);
        if (!reservas || reservas.length === 0) return [];
        
        const row = reservas[0];
        const servicios = await this.reserva.serviciosPorReserva(reserva_id);
        return [this.armarReservaJson(row, servicios)];
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
        const reservas = await this.reserva.obtenerReservaPorId(result.reserva_id);
        const row = reservas[0];
        const serviciosReserva = await this.reserva.serviciosPorReserva(result.reserva_id);
        return [this.armarReservaJson(row, serviciosReserva)];

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

        const reservas = await this.reserva.obtenerReservaPorId(reserva_id);
        const row = reservas[0];
        const serviciosReserva = await this.reserva.serviciosPorReserva(reserva_id);
        return [this.armarReservaJson(row, serviciosReserva)];
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
