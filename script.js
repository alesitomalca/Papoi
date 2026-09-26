let planes = JSON.parse(localStorage.getItem("planesPareja")) || [
    {
        id: Date.now() + 1,
        texto: "Ver el atardecer juntos",
        completado: false,
        fecha: null
    },
    {
        id: Date.now() + 2,
        texto: "Cocinar nuestra cena favorita",
        completado: false,
        fecha: null
    },
    {
        id: Date.now() + 3,
        texto: "Hacer un viaje juntos",
        completado: false,
        fecha: null
    }
];


const lista = document.getElementById("listaPlanes");
const input = document.getElementById("nuevoPlan");
const btnAgregar = document.getElementById("btnAgregar");

const textoProgreso =
    document.getElementById("textoProgreso");

const porcentaje =
    document.getElementById("porcentaje");

const barra =
    document.getElementById("barraProgreso");

const contador =
    document.getElementById("contadorPlanes");


function guardar() {

    localStorage.setItem(
        "planesPareja",
        JSON.stringify(planes)
    );

}


function renderizar() {

    lista.innerHTML = "";

    if (planes.length === 0) {

        lista.innerHTML = `
            <div class="vacio">
                Todavía no tienen planes agregados ♡
                <br>
                ¿Cuál será el primero?
            </div>
        `;

    }


    planes.forEach(plan => {

        const elemento =
            document.createElement("div");

        elemento.className =
            "plan" +
            (plan.completado ? " completado" : "");

        elemento.innerHTML = `

            <button
                class="check"
                onclick="completar(${plan.id})"
                title="Marcar como cumplido"
            >
                ${plan.completado ? "✓" : ""}
            </button>


            <div class="plan-contenido">

                <div class="plan-texto">
                    ${escaparHTML(plan.texto)}
                </div>

                <div class="fecha">
                    Cumplido ${plan.fecha || ""} ♡
                </div>

            </div>


            <div class="acciones">

                <button
                    class="btn-accion"
                    onclick="editar(${plan.id})"
                    title="Editar"
                >
                    ✎
                </button>

                <button
                    class="btn-accion btn-eliminar"
                    onclick="eliminar(${plan.id})"
                    title="Eliminar"
                >
                    ×
                </button>

            </div>

        `;

        lista.appendChild(elemento);

    });


    actualizarProgreso();

}


function agregar() {

    const texto = input.value.trim();

    if (!texto) {
        return;
    }


    planes.unshift({

        id: Date.now(),

        texto: texto,

        completado: false,

        fecha: null

    });


    input.value = "";

    guardar();

    renderizar();

}


function completar(id) {

    const plan =
        planes.find(p => p.id === id);


    if (!plan) return;


    plan.completado =
        !plan.completado;


    if (plan.completado) {

        plan.fecha =
            new Date().toLocaleDateString(
                "es-PE",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    } else {

        plan.fecha = null;

    }


    guardar();

    renderizar();

}


function editar(id) {

    const plan =
        planes.find(p => p.id === id);


    if (!plan) return;


    const nuevoTexto =
        prompt(
            "Editar nuestro plan:",
            plan.texto
        );


    if (
        nuevoTexto !== null &&
        nuevoTexto.trim() !== ""
    ) {

        plan.texto =
            nuevoTexto.trim();

        guardar();

        renderizar();

    }

}


function eliminar(id) {

    const confirmar =
        confirm(
            "¿Eliminar este plan de la lista?"
        );


    if (!confirmar) return;


    planes =
        planes.filter(
            p => p.id !== id
        );


    guardar();

    renderizar();

}


function actualizarProgreso() {

    const total =
        planes.length;


    const completados =
        planes.filter(
            p => p.completado
        ).length;


    let porcentajeNumero = 0;


    if (total > 0) {

        porcentajeNumero =
            Math.round(
                (completados / total) * 100
            );

    }


    textoProgreso.textContent =
        `${completados} de ${total} planes cumplidos`;


    porcentaje.textContent =
        `${porcentajeNumero}%`;


    barra.style.width =
        `${porcentajeNumero}%`;


    contador.textContent =
        total === 1
            ? "1 plan"
            : `${total} planes`;

}


function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}


btnAgregar.addEventListener(
    "click",
    agregar
);


input.addEventListener(
    "keydown",
    function(evento) {

        if (evento.key === "Enter") {
            agregar();
        }

    }
);


renderizar();
