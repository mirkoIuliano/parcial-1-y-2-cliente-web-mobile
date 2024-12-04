<script setup>
import { ref } from 'vue';
import { editMyProfilePhoto } from '../services/auth';
import BaseHeading from '../components/BaseHeading.vue';

const editData = ref({
    photo: null,
    photoPreview: null,
})

const loading = ref(false)

// el mensaje de exito se va a estar en la siguiente variable
const successMessage = ref("")

async function handleSubmit() {
    // Preguntamos que si ya está cargando, que no haga nada. Esto lo hacemos para que si se cliquea el btn no lo puedan volver a cliquear varias veces seguidas
    if(loading.value) return; // Si sigue cargando y apretan los manda al return de una así no se hacen muchas peticiones al pepe

    loading.value = true

    try {
        await editMyProfilePhoto(editData.value.photo)
    } catch (error) {
        // TODO
    }

    successMessage.value = "¡Se actaulizó la foto de perfil con éxito!"
    loading.value = false
}

async function handleFileSelection(ev) {
    successMessage.value = ""
    /*
    Nuestro objetivo acá es obtener la imagen que el usuario seleccionó, guardarla e editDate, y leerla para aramar el preview
    Para obtener la imagen, necesitamos pedírsela al <input>
    Si bien la podemos obtener con un docuemnt.getElementById(), no se recomienda usar esto en Vue porque las referencias obtenidas de esta forma puede perderse en cualquier momento. Vue puede estar reconstruyendo el componente en cualquier momento por lo cual si busco un campo, ese campo la proxima vez que Vue redibuje la página puede cambiar por otro nuevo.
    En su lugar se recomienda usar el evento Event con su propiedad "target"
    El objeto Event tiene mucha info sobre los eventos (qué tipo de evento es; qué elemento lo disparó; si es un evento de mouse, dónde estaba el cursos de mouse; si es un evento de teclado qué tecla se apretó)

    const input = ev.target; Esto sería la referencia del input
    Con la referencia del input file, podemos obtener los archivos que seleccionar usando la propiedad "files", que conteien u "filelist".
    FileList es una clase que, en esencia es un array de obetos File.
    editData.value.photo = ev.target.files; ===> Esto sería un array

    Como nosotros sabemos que nuestro input no tiene la propiedad "multiple", solo puede contener un único arhcivo. Por lo que podemos hard-codear el [0]
    editData.value.photo = ev.target.files[0];
    */
    editData.value.photo = ev.target.files[0];
    // console.log("Archivo", editData.value.photo)

    // Ahora que contamos con el File, vamos a leerlo para poder hacer la previsualización
    // Con este objetivo en mente instanciamos la clase FileReader. FileReader es una clase propia de JS que permite leer archivos
    const reader = new FileReader()

    // Como sucede con otras APIs (por ejemplo, XHR), antes de leer el archivo tenemos que configurar lo que queremos que se haga al completarse la lectura
    reader.addEventListener('load', function(){
        // Guardamos el resultado de la lectura
        editData.value.photoPreview = reader.result // en la propiedad 'result' del reader nosotros vamos a tener lo que se haya leído
        console.log(editData.value.photoPreview)
    })

    // Leemos el archivo
    // Como queremos usarlo para el "src" de una etiqueta <img>, necesitamos tener el archivo con un formato de URL. Como no tenemos una ruta para poner porque nuestro archivo es local, vamos a usar una "data URL".
    // Una "data URL" es una URL que utiliza el protocolo "data:" (en vez de HTTP o HTTPS), y contiene un archivo codificado como string (generalmente, en base64)
    // base64 es un formato de cifrado reversible que transforma cualquier tipo de datos en una representación como texto. Se usa para transformar archivos de cualquier tipo en texto 

    reader.readAsDataURL(editData.value.photo)

}


</script>

<template>
    <BaseHeading>Editar mi foto de Perfil</BaseHeading>

    <div class="flex md:flex-row gap-6 md:items-start max-w-4xl m-auto bg-white p-8 rounded-lg shadow-lg border border-slate-300 my-8 flex-col items-center">
        <form 
            class="w-1/2"
            action="#"
            @submit.prevent=handleSubmit
        >
        <div class="mb-6">
            <label for="photo" class="block mb-2 text-lg font-semibold text-slate-700">Foto de Perfil</label>
            <input 
                type="file"
                id="photo" 
                class="block w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500" 
                @change="handleFileSelection"
            >
            <!-- como es un input de tipo file no se puede usar v-model y en reemplazo usamos un evento de tipo change -->
        </div>

        
        <button class="w-2/4 min-w-48 bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 focus:bg-slate-700 transition-colors duration-200">{{ !loading ? 'Actualizar Foto' : 'Enviando...'}}</button>

        <!-- Mensaje de éxito -->
        <div v-if="successMessage" class="text-green-600 font-medium mt-4">
            {{ successMessage }}
        </div>
        
        </form>
        <div class="w-1/2">
            <h2 class="mb-2 text-lg font-semibold text-slate-700 text-center">Previsualización</h2>
            <div class="w-64 h-64 flex items-center justify-center border border-dashed border-slate-300 bg-slate-50 rounded-full m-auto">
                <img 
                    v-if="editData.photoPreview" 
                    :src="editData.photoPreview" 
                    class="w-64 h-64 object-cover border rounded-full"
                >
            </div>
        </div>
    </div>

</template>