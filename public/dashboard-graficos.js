
async function cargarSalonesEnGrafico() {
    
    const ctx = document.getElementById('salonesXImporteChart').getContext('2d');

    try {
        const response = await fetch("/api/v1/salones", {
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });

        if (!response.ok) { throw new Error(`Error en la solicitud: ${response.status}`); }

        const datos = await response.json();
        const salones = datos.salones;
        
        const labels = salones.map(s => s.titulo);
        const importesSalones = salones.map(s => s.importe);

        // Paso 2: Definir los datos
        const datosGrafico = {
            // Etiquetas (Categorías en el eje X)
            labels: labels,
            // Conjuntos de datos. Puedes tener uno o varios.
            datasets: [{
                label: 'Importe', // Leyenda del dataset
                data: importesSalones, // Valores de las barras
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)', // Color Barra 1
                    'rgba(54, 162, 235, 0.5)', // Color Barra 2
                    'rgba(255, 206, 86, 0.5)', // y así sucesivamente...
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)'
                ],
                borderColor: [ // Borde de las barras
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        };
        // Paso 3: Definir las opciones del gráfico (Opcional)
        const opcionesGrafico = {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true, // Asegura que el eje Y comience en cero
                    title: { display: true, text: 'Importe' }
                }
            },
            plugins: {
                legend: {
                    display: true, // Muestra la leyenda
                },
                title: { display: true, text: 'Salones por Importe' }
            }
        };
        // Paso 4: Crear la instancia del gráfico
        const miBarChart = new Chart(ctx, {
            type: 'bar', // Tipo de gráfico: 'bar' para barras verticales
            data: datosGrafico,
            options: opcionesGrafico
        });
    } catch (error) {
        console.error('Hubo un error al cargar los datos en el gráfico', error)
    }
}

document.addEventListener('DOMContentLoaded', cargarSalonesEnGrafico);


