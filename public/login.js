// import { body } from "express-validator";

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre_usuario = document.getElementById("usuario").value;
    const contrasenia = document.getElementById("password").value;
    console.log(JSON.stringify({ usuario, password }))

    try {
        const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_usuario, contrasenia })
        });

        const data = await response.json();
        console.log(data)
        if (data.token) {
            // Guardar token en localStorage
            localStorage.setItem("token", data.token);
            // Redirigir al dashboard
            window.location.href = "/dashboard";
        } else {
            errorMsg.textContent = data.message || "Usuario o contraseña incorrectos";
        }
    } catch (err) {
        errorMsg.textContent = "Error al conectar con el servidor";
        console.error(err);
    }
});


