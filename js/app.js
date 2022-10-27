//variables
//formulario
const formulario = document.querySelector('#formulario');
//resultados
const resultado = document.querySelector('#resultado');
//variable donde se renderizara la paginacion
const paginacionDiv = document.querySelector('#paginacion');
//varible que representa la cantidad de registros que mostrara la API
const registrosPorPagina = 40;
//variable para saber el total de paginas para hacer la paginacion
let totalPaginas;
//iterador para el generador
let iterador;
//la primera vez que se mande a llamar la paginacion su valor sera de 1
let paginaActual = 1;


//listeners
//onload = DOMContentLoaded
window.onload = () => {
    //listener al formulario
    formulario.addEventListener('submit', validarFormulario);
};
//funcion para validar formulario
function validarFormulario( e )  {
    //prevenir la accion por default
    e.preventDefault();
    //variables del input termino de busqueda
    //obtenemos el valor del input
    const terminoBusqueda = document.querySelector('#termino').value;
    //validar que no este vacio
    if ( terminoBusqueda === '') {
        //llamamos la funcion para mostrar la alerta
        mostrarAlerta("Agrega un termino de busqueda");
        return;
    }
    //llamar funcion para buscarImagen desde la API
    buscarImagenes();
}
//funcion para agregar alerta 
function mostrarAlerta( mensaje ) {
    //verificar si hay otra alertas
    const alertas = document.querySelector('.bg-red-100');
    //EN CASO DE QUE NO HAYA OTRAS ALERTAS, LA AGREGAMOS
    if ( !alertas ) {
        //construir el html
        const alerta = document.createElement('p');
        //estilos
        alerta.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded', 'max-w-lg', 'mx-auto', 'mt-6', 'text-center');
        //innerhtml
        alerta.innerHTML = `
            <strong class="font-bold">¡Error!</strong>
            <span class="block sn:inline">${ mensaje }</span>
        `;
        //renderizar
        formulario.appendChild( alerta );
        //quitar alertas despues de 5 segundos
        setTimeout(() => {
            //quitar alerta
            alerta.remove();
        }, 5000);
    }
}

//consultar la API para buscar la imagen
function buscarImagenes() {
    //obtenemos el valor del input
    const termino = document.querySelector('#termino').value;

    //key de la API
    const key = '30907566-3221c4d1c76ae349991022cae';
    //url
    const url = `https://pixabay.com/api/?key=${ key }&q=${ termino }&per_page=${ registrosPorPagina }&page=${ paginaActual }`;
    //fetch
    fetch( url )
        .then( respuesta => respuesta.json() )
            .then( resultado => {
                //llamamos funcion para calcular el numero de paginas en base al numero de registros
                //pasamos como argumento resultado.totalHits que es, el numero total de registros traidos desde la API
                totalPaginas = calcularPaginas( resultado.totalHits );
                //console.log( totalPaginas );
                //llamar la funcion mostrarImagenes
                //y como argumento le pasamos resultado.hits que son las imagenes con su informacion
                mostrarImagenes( resultado.hits );
            });
    
}
//generador que va a registrar la cantidad de elementos de acuerdo a las paginas
//los generadores llevan un * despues de function
//function *
//pasamos como argumento total
function *crearPaginador( total ) {
    //inicializamos i igual a 1
    for( let i = 1; i <= total; i++) {
        //con yield registramos el valor
        yield i;
    }
}

//funcion para calcular las paginas de forma dinamica
function calcularPaginas( total ) {
    //con esta formula calcular el numero de paginas que deben de haber en base a el numero de registros que no traiga la API
    //( total de registro / numero de registros por pagina )
    // con Math.ceil en caso de que sea un numero decimal cercano hacia abajo, lo redondea hacia arriba
    return parseInt( Math.ceil( total / registrosPorPagina) );
}

//funcion para mostrar las imagenes
function mostrarImagenes( imagenes ) {
    
    //while para limpiar el html anterior
    while ( resultado.firstChild ) {
        resultado.removeChild( resultado.firstChild );
    }
    
    //iterar sobre el arreglo de imagenes y construir el HTML
    imagenes.forEach( imagen => {
        //destructuring
        const { previewURL, likes, views, largeImageURL } = imagen;
        //console.log( imagen );    
        //renderizamos con innehtml
        resultado.innerHTML += `
            <div class="w-1/2 md:w-1/3 lg:w-1/4 p-3 mb-4">
                <div class="bg-white">
                    <img class="w-full" src="${ previewURL }" >

                    <div class="p-4">
                        <p class="font-bold"> ${ likes } <span class="font-light">Me Gusta</span></p>
                        <p class="font-bold"> ${ views } <span class="font-light">Veces vista</span></p>

                        <a  class="block w-full bg-blue-800 hover:bg-blue-500 text-white uppercase font-bold text-center rounded mt-5 p-1" 
                            href="${ largeImageURL }"  
                            target="_blank" 
                            rel="noopener noreferrer"
                        > 
                            Ver Imagen
                        </a>
                    </div>
                </div>
            </div>
        `;

    });
    //limpiar el paginador previo
    while ( paginacionDiv.firstChild ) {
        paginacionDiv.removeChild( paginacionDiv.firstChild );
    }
    //llamamos la funcion para imprimir paginador
    imprimirPaginador();

}
//funcion para imprimir el paginador
function imprimirPaginador() {
    //llamamos el generador
    iterador = crearPaginador( totalPaginas );
    
    //console.log( iterador.next() ); ///{value: 1, done: false} en consola
    //con un while vamos a revisar un true
    while ( true ) {
        //destructuring
        //value = pagina actual, 1,2,3,4, etc..
        //done = si ya estan terminadas las paginas, que ya estan todas las paginas
        const { value, done } = iterador.next();
        //en caso de que sea DONE es decir que ya este hecho ya no se ejecuta nada con un return
        if ( done ) return;

        //en caso contrario, genera un boton por cada elemento en el generador
        const boton = document.createElement('a');
        //href
        boton.href = '#';
        //data-pagina = 1,2,3,4, etc...
        boton.dataset.pagina = value;
        //texcontent
        boton.textContent = value;
        //estilos
        boton.classList.add('siguiente', 'bg-yellow-400', 'px-4', 'py-1', 'mr-2', 'font-bold', 'mb-1', 'rounded');

        //funcion para cambiar de paginacion
        boton.onclick = () => {
            //la pagina actual sera al value, 1,2,3,4,5, etc...
            paginaActual = value;
            //console.log( paginaActual );
            //consultar de nuevo la funcion buscar Imagenes
            buscarImagenes();
        }

        //renderizacion
        paginacionDiv.appendChild( boton );

    }

}