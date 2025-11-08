CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ingresos_por_salon`()
BEGIN
    SELECT 
        s.salon_id,
        s.titulo AS salon,
        COUNT(r.reserva_id) AS cantidad_reservas,
        IFNULL(SUM(r.importe_total), 0) AS total_ingresos
    FROM salones s
    LEFT JOIN reservas r 
        ON s.salon_id = r.salon_id AND r.activo = 1
    GROUP BY s.salon_id, s.titulo
    ORDER BY total_ingresos DESC;
END