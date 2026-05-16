// Cargar citas existentes de la memoria o iniciar vacío
let citas = JSON.parse(localStorage.getItem('mis_citas')) || [];

// Renderizar las citas al cargar la página por completo
window.onload = function() {
    renderizarCitas();
};

function guardarEnLocalStorage() {
    localStorage.setItem('mis_citas', JSON.stringify(citas));
}

function renderizarCitas() {
    const container = document.getElementById('container-citas');
    container.innerHTML = '';

    if(citas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">No hay citas aún. ¡Presiona el botón + para añadir una!</p>';
        return;
    }

    citas.forEach((cita, index) => {
        const card = document.createElement('div');
        card.className = 'cita-card';
        card.onclick = (e) => manejarClickCita(e, index);

        // Cuadradito marcador izquierdo
        const checkbox = document.createElement('div');
        checkbox.className = `checkbox-cita ${cita.completada ? 'checked' : ''}`;
        checkbox.dataset.action = 'check'; 

        const titulo = document.createElement('div');
        titulo.className = 'titulo-cita';
        titulo.innerText = cita.nombre;

        card.appendChild(checkbox);
        card.appendChild(titulo);
        container.appendChild(card);
    });
}

function abrirModalNuevaCita() {
    document.getElementById('modal-nueva-cita').style.display = 'flex';
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

function guardarNuevaCita() {
    const nombre = document.getElementById('nuevo-nombre-cita').value.trim();
    if(!nombre) return alert("¡Ponle un nombre a la cita!");

    citas.push({
        nombre: nombre,
        completada: false,
        fecha: '',
        comentario: '',
        fotos: []
    });

    guardarEnLocalStorage();
    renderizarCitas();
    document.getElementById('nuevo-nombre-cita').value = '';
    cerrarModal('modal-nueva-cita');
}

function manejarClickCita(e, index) {
    // Si el clic fue en el checkbox izquierdo
    if (e.target.closest('[data-action="check"]')) {
        if (!citas[index].completada) {
            document.getElementById('completar-id').value = index;
            document.getElementById('completar-fecha').value = '';
            document.getElementById('completar-comentario').value = '';
            document.getElementById('completar-fotos').value = '';
            document.getElementById('modal-completar-cita').style.display = 'flex';
        } else {
            if(confirm("¿Quieres desmarcar esta cita y borrar sus fotos/recuerdos?")) {
                citas[index].completada = false;
                citas[index].fecha = '';
                citas[index].comentario = '';
                citas[index].fotos = [];
                guardarEnLocalStorage();
                renderizarCitas();
            }
        }
    } else {
        // Si hicieron clic en el cuerpo de la cita
        if (citas[index].completada) {
            document.getElementById('detalle-titulo').innerText = citas[index].nombre;
            document.getElementById('detalle-fecha').innerText = citas[index].fecha;
            document.getElementById('detalle-comentario').innerText = citas[index].comentario || 'Sin comentarios.';
            
            const galeria = document.getElementById('detalle-galeria');
            galeria.innerHTML = '';
            citas[index].fotos.forEach(foto => {
                const img = document.createElement('img');
                img.src = foto;
                galeria.appendChild(img);
            });

            document.getElementById('modal-detalle-cita').style.display = 'flex';
        } else {
            alert("¡Aún no han tenido esta cita! Marquen el corazoncito cuando la cumplan. 😉");
        }
    }
}

// Lógica asíncrona para transformar imágenes a Base64 y guardarlas
async function guardarCitaCumplida() {
    const index = document.getElementById('completar-id').value;
    const fecha = document.getElementById('completar-fecha').value;
    const comentario = document.getElementById('completar-comentario').value.trim();
    const inputFotos = document.getElementById('completar-fotos');

    if(!fecha) return alert("Por favor, selecciona la fecha de la cita.");

    const promesasFotos = Array.from(inputFotos.files).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file); 
        });
    });

    const fotosBase64 = await Promise.all(promesasFotos);

    citas[index].completada = true;
    citas[index].fecha = fecha;
    citas[index].comentario = comentario;
    citas[index].fotos = fotosBase64;

    guardarEnLocalStorage();
    renderizarCitas();
    cerrarModal('modal-completar-cita');
}