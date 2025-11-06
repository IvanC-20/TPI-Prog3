fetch("/api/v1/salones", {
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("token") // si tu API usa JWT
    }
})
.then(res => res.json())
.then(data => {
    const salones = data.salones;
    const listaSalones = document.getElementById("lista-salones");
    salones.forEach(salon => {
        let li = document.createElement('li');
        li.innerText=`Titulo: ${salon.titulo}`;
        listaSalones.appendChild(li);
    });
    // const labels = reservas.map(r => r.dia);
    // const data = reservas.map(r => r.cantidad);

    // const ctx = document.getElementById('reservasChart').getContext('2d');
    // new Chart(ctx, {
    //     type: 'bar',
    //     data: {
    //         labels: labels,
    //         datasets: [{
    //             label: 'Reservas por día',
    //             data: data,
    //             backgroundColor: 'rgba(54, 162, 235, 0.5)',
    //             borderColor: 'rgba(54, 162, 235, 1)',
    //             borderWidth: 1
    //         }]
    //     },
    //     options: { scales: { y: { beginAtZero: true } } }
    // });
});

