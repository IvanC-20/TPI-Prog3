# TPI–Prog3 · API de Reservas

API REST (Node.js + Express 5) para gestionar **Usuarios, Salones, Servicios, Turnos, Reservas e Invitados** con autenticación **JWT**, autorización por **roles** y **documentación Swagger**.

> **Integrantes**  
> - Argañaraz Abigail  
> - Cáceres Iván  
> - Roth Mauro  
> - Spinnenhirn Soledad


---

## ✨ Características

- **BREAD completo** (Browse/Read/Edit/Add/Delete) para:
  - Usuarios, Salones, Servicios, Turnos, Reservas, Invitados
- **Autenticación** con **JWT**
- **Autorización** por **roles**:
  - `1 = Admin`, `2 = Empleado`, `3 = Cliente`
- **Validaciones** con `express-validator`
- **Swagger UI** en `/docs`
- **Logger HTTP** con `morgan`
- **MySQL/MariaDB** vía `mysql2`
- **Emails** (plantillas con `handlebars`, envío con `nodemailer`)
- **Exportes/Reportes** (ej: `/reservas/informe`)

---

## 🧱 Stack

- **Node.js** `>= 18`
- **Express** `^5.1.0`
- **JWT** (`jsonwebtoken`, `passport`, `passport-jwt`, `passport-local`)
- **Swagger** (`swagger-jsdoc`, `swagger-ui-express`)
- **MySQL2**
- **dayjs**, **morgan**, **dotenv**, **handlebars**, **csv-writer**

---

## 🔐 Roles & Permisos (ejemplos)

- **Reservas**
  - `GET /reservas` → **Admin(1), Empleado(2), Cliente(3)**
  - `GET /reservas/:reserva_id` → **Admin(1), Empleado(2)** ven todas; **Cliente(3)** solo propias
  - `POST /reservas` → **Admin(1), Cliente(3)**
  - `PUT /reservas/:reserva_id` → **Admin(1)**
  - `DELETE /reservas/:reserva_id` → **Admin(1)** (soft delete)
- Reglas similares para Salones, Servicios, Turnos, Usuarios e Invitados (ver Swagger).

---

## 📘 Documentación API (Swagger)

- UI: `http://localhost:3000/docs`
- Base path API: `http://localhost:3000/api/v1`


---

## ⚙️ Variables de Entorno (`.env`)

```env
# Server
PORT=3000

# DB
HOST=localhost
USERDB=tu_usuario
PASSWORDDB=tu_password
DATABASE=tu_base

# JWT
JWT_SECRET=una_llave_segura

# Mail
USERCORREO=smtp.ejemplo.com
PASSCORREO=clave

```

---

## 🗄️ Base de Datos

Crear la base y tablas (MySQL/MariaDB).  
Ejemplo de campos relevantes:

- **reservas** (soft delete con `activo`)
- **servicios**, **salones**, **turnos**, **usuarios**
- **reservas_servicios**: `reserva_servicio_id`, `reserva_id*`, `servicio_id*`, `importe*`, `creado`, `modificado`
  - En API, el **payload** de `servicios` dentro de una `Reserva` requiere **`servicio_id`** e **`importe`**.  
  - El **`reserva_id`** se asigna internamente al crear la reserva.

---

## 🚀 Puesta en Marcha

1. **Clonar** el repo (rama `entrega-final` si corresponde)
   ```bash
   git clone https://github.com/IvanC-20/TPI-Prog3.git
   cd TPI-Prog3
   ```
2. **Crear `.env`** (usar el ejemplo de arriba)
3. **Instalar dependencias**
   ```bash
   npm install
   ```
4. **Arrancar**
   - Desarrollo (watch):
     ```bash
     npm run des      
     ```
 
5. **Abrir Swagger:**  
   `http://localhost:3000/docs`

---

## 🔑 Autenticación (flujo sugerido)

1. **Login** (Local Strategy / emisión JWT) → recibir `token`
2. Para endpoints protegidos:  
   Header `Authorization: Bearer <tu_token>`

> Consultar en Swagger los endpoints de auth/usuarios disponibles.

---


## 🧾 Endpoints útiles

- **Reservas – Informe**: `GET /api/v1/reservas/informe` (solo Admin)  
  Genera reporte de ingresos.

---

## 🛡️ Notas de Seguridad

- Mantener `JWT_SECRET` fuera del repositorio.
- Usar usuarios DB con permisos mínimos.
- Validar inputs con `express-validator` (ya aplicado en rutas).
- Revisar CORS según el front que consuma la API.

---

## 👨‍🏫 Agradecimientos

Queremos **agradecer a los profesores** por la cursada, todo lo aprendido y la **buena onda** de principio a fin.  
Gracias por el tiempo, la paciencia y por impulsarnos a llevar este proyecto a un nivel profesional. 🙌 ❤️

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **ISC** (ver `package.json`).  
Usar con fines académicos y educativos.

---

## 📬 Contacto

- Repo: https://github.com/IvanC-20/TPI-Prog3
- Equipo: ver lista de **Integrantes** arriba.
