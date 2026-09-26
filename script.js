// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://nxpnkrrfdxremodbdjfy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pvZD0JOjhvWhHcLrZKsiqg_RZ7yLqm-";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// ELEMENTOS DE LA PÁGINA
// ==========================================

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


// Aquí guardamos temporalmente lo que viene de Supabase
let planes = [];


// ==========================================
// CARGAR PLANES
// ==========================================

async function cargarPlanes() {

    lista.innerHTML = `
        <div class="vacio">
            Cargando nuestros planes...
        </div>
    `;

    const { data, error } = await db
        .from("planes")
        .select("*")
        .order("creado_en", {
            ascending: false
        });


    if (error) {

        console.error(
            "Error cargando planes:",
            error
        );

        lista.innerHTML = `
            <div class="vacio">
                No pudimos cargar nuestros planes :c
            </div>
        `;

        return;
    }


    planes = data || [];

    renderizar();

}


// ==========================================
// MOSTRAR PLANES
// ==========================================

function renderizar() {

    lista.innerHTML = "";


    if (planes.length === 0) {

        lista.innerHTML = `
            <div class="vacio">
                Todavía no tenemos planes agregados
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
                    ${
                        plan.fecha
                            ? "Cumplido " +
                              formatearFecha(plan.fecha) +
                              " ♡"
                            : ""
                    }
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


// ==========================================
// AGREGAR PLAN
// ==========================================

async function agregar() {

    const texto =
        input.value.trim();


    if (!texto) {
        return;
    }


    btnAgregar.disabled = true;
    btnAgregar.textContent = "Agregando...";


    const { error } = await db
        .from("planes")
        .insert({

            texto: texto,

            completado: false

        });


    btnAgregar.disabled = false;
    btnAgregar.textContent = "+ Agregar plan";


    if (error) {

        console.error(
            "Error agregando plan:",
            error
        );

        alert(
            "No se pudo agregar el plan."
        );

        return;
    }


    input.value = "";


    await cargarPlanes();

}


// ==========================================
// COMPLETAR / DESMARCAR
// ==========================================

async function completar(id) {

    const plan =
        planes.find(
            p => p.id === id
        );


    if (!plan) {
        return;
    }


    const nuevoEstado =
        !plan.completado;


    const { error } = await db
        .from("planes")
        .update({

            completado:
                nuevoEstado,

            fecha:
                nuevoEstado
                    ? new Date().toISOString()
                    : null

        })
        .eq("id", id);


    if (error) {

        console.error(
            "Error actualizando:",
            error
        );

        alert(
            "No se pudo actualizar el plan."
        );

        return;
    }


    await cargarPlanes();

}


// ==========================================
// EDITAR
// ==========================================

async function editar(id) {

    const plan =
        planes.find(
            p => p.id === id
        );


    if (!plan) {
        return;
    }


    const nuevoTexto =
        prompt(
            "Editar nuestro plan:",
            plan.texto
        );


    if (
        nuevoTexto === null ||
        nuevoTexto.trim() === ""
    ) {
        return;
    }


    const { error } = await db
        .from("planes")
        .update({

            texto:
                nuevoTexto.trim()

        })
        .eq("id", id);


    if (error) {

        console.error(
            "Error editando:",
            error
        );

        alert(
            "No se pudo editar el plan."
        );

        return;
    }


    await cargarPlanes();

}


// ==========================================
// ELIMINAR
// ==========================================

async function eliminar(id) {

    const confirmar =
        confirm(
            "¿Eliminar este plan de nuestra lista?"
        );


    if (!confirmar) {
        return;
    }


    const { error } = await db
        .from("planes")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Error eliminando:",
            error
        );

        alert(
            "No se pudo eliminar el plan."
        );

        return;
    }


    await cargarPlanes();

}


// ==========================================
// PROGRESO
// ==========================================

function actualizarProgreso() {

    const total =
        planes.length;


    const completados =
        planes.filter(
            p => p.completado
        ).length;


    const numeroPorcentaje =
        total === 0
            ? 0
            : Math.round(
                (completados / total) * 100
            );


    textoProgreso.textContent =
        `${completados} de ${total} planes cumplidos`;


    porcentaje.textContent =
        `${numeroPorcentaje}%`;


    barra.style.width =
        `${numeroPorcentaje}%`;


    contador.textContent =
        total === 1
            ? "1 plan"
            : `${total} planes`;

}


// ==========================================
// FORMATEAR FECHA
// ==========================================

function formatearFecha(fecha) {

    return new Date(fecha)
        .toLocaleDateString(
            "es-PE",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


// ==========================================
// SEGURIDAD PARA EL TEXTO
// ==========================================

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}


// ==========================================
// BOTONES
// ==========================================

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


// ==========================================
// TIEMPO REAL
// ==========================================

db
    .channel("planes-compartidos")

    .on(
        "postgres_changes",

        {
            event: "*",
            schema: "public",
            table: "planes"
        },

        () => {

            cargarPlanes();

        }
    )

    .subscribe();


// ==========================================
// INICIAR PAPOI ♡
// ==========================================

cargarPlanes();
