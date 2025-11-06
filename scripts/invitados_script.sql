CREATE TABLE `invitados` (
  `invitado_id` INT(11) NOT NULL AUTO_INCREMENT,
  `reserva_id` INT(11) NOT NULL,
  `nombre` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmado` TINYINT(1) NOT NULL DEFAULT '0',
  `notificado` TINYINT(1) NOT NULL DEFAULT '0',  -- 0=no enviado, 1=enviado
  `activo` TINYINT(1) NOT NULL DEFAULT '1',
  `creado` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modificado` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`invitado_id`),
  KEY `invitados_fk1` (`reserva_id`),
  CONSTRAINT `invitados_fk1`
    FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`reserva_id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
