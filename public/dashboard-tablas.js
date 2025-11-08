async function cargarSalonesEnTabla() {
    const cabeceraTablaSalones = document.getElementById('cabecera-tabla-salones');
    const cuerpoTablaSalones = document.getElementById('cuerpo-tabla-salones');

    try {
        const response = await fetch("/api/v1/salones", {
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });
        if (!response.ok) {throw new Error(`Error en la solicitud: ${response.status}`);}

        const datos = await response.json(); // Convierte la respuesta a JSON
        const salones = datos.salones;
        const cabecera = Object.keys(salones[0]);
        
        const filaCabecera = document.createElement('tr');
        
        const celdaIdSalonesC = document.createElement('th');
        celdaIdSalonesC.textContent = cabecera[0];
        filaCabecera.appendChild(celdaIdSalonesC);

        const celdaTituloC = document.createElement('th');
        celdaTituloC.textContent = cabecera[1];
        filaCabecera.appendChild(celdaTituloC);

        const celdaDireccionC = document.createElement('th');
        celdaDireccionC.textContent = cabecera[2];
        filaCabecera.appendChild(celdaDireccionC);

        const celdaCapacidadC = document.createElement('th');
        celdaCapacidadC.textContent = cabecera[5];;
        filaCabecera.appendChild(celdaCapacidadC);
        const celdaImporteC = document.createElement('th');
        celdaImporteC.textContent = cabecera[6]
        filaCabecera.appendChild(celdaImporteC);
        
        cabeceraTablaSalones.appendChild(filaCabecera);
        
        salones.forEach(salon => {
           
            const filaCuerpo = document.createElement('tr');

            const celdaIdSalones = document.createElement('td');
            celdaIdSalones.textContent = salon.salon_id;
            filaCuerpo.appendChild(celdaIdSalones);

            const celdaTitulo = document.createElement('td');
            celdaTitulo.textContent = salon.titulo;
            filaCuerpo.appendChild(celdaTitulo);

            const celdaDireccion = document.createElement('td');
            celdaDireccion.textContent = salon.direccion;
            filaCuerpo.appendChild(celdaDireccion);

            const celdaCapacidad = document.createElement('td');
            celdaCapacidad.textContent = salon.capacidad;
            filaCuerpo.appendChild(celdaCapacidad);

            const celdaImporte = document.createElement('td');
            celdaImporte.textContent = salon.importe;
            filaCuerpo.appendChild(celdaImporte);
            
            cuerpoTablaSalones.appendChild(filaCuerpo);

        });
    } catch (error) {
        console.error('Hubo un error al cargar los datos:', error);
        // Muestra un mensaje de error en la tabla
        cuerpoTablaSalones.innerHTML = `<tr><td colspan="3">Error al cargar los datos. Intente de nuevo.</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', cargarSalonesEnTabla);
///////////////////////////////////////////////////////////////////////////////////////////
async function cargarUsuariosEnTabla() {
    const cabeceraTablaUsuarios = document.getElementById('cabecera-tabla-usuarios');
    const cuerpoTablaUsuarios = document.getElementById('cuerpo-tabla-usuarios');

    try {
        const response = await fetch("/api/v1/usuarios", {
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });
        if (!response.ok) {throw new Error(`Error en la solicitud: ${response.status}`);}

        const datos = await response.json(); 
        const usuarios = datos.usuarios;
        const cabecera = Object.keys(usuarios[0]);
        console.log(cabecera)
        
        const filaCabecera = document.createElement('tr');
        
        const celdaIdUsuarioC = document.createElement('th');
        celdaIdUsuarioC.textContent = cabecera[0];
        filaCabecera.appendChild(celdaIdUsuarioC);

        const celdaNombreC = document.createElement('th');
        celdaNombreC.textContent = cabecera[1];
        filaCabecera.appendChild(celdaNombreC);

        const celdaApellidoC = document.createElement('th');
        celdaApellidoC.textContent = cabecera[2];
        filaCabecera.appendChild(celdaApellidoC);

        cabeceraTablaUsuarios.appendChild(filaCabecera);
        
        usuarios.forEach(usuario => {
           
            const filaCuerpo = document.createElement('tr');

            const celdaIdUsuario = document.createElement('td');
            celdaIdUsuario.textContent = usuario.usuario_id;
            filaCuerpo.appendChild(celdaIdUsuario);

            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = usuario.nombre;
            filaCuerpo.appendChild(celdaNombre);

            const celdaApellido = document.createElement('td');
            celdaApellido.textContent = usuario.apellido;
            filaCuerpo.appendChild(celdaApellido);
            
            cuerpoTablaUsuarios.appendChild(filaCuerpo);

        });
    } catch (error) {
        console.error('Hubo un error al cargar los datos:', error);
        // Muestra un mensaje de error en la tabla
        cuerpoTablaUsuarios.innerHTML = `<tr><td colspan="3">Error al cargar los datos. Intente de nuevo.</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', cargarUsuariosEnTabla);