<script setup>
import { ref } from 'vue'
import { editMyProfilePhoto } from '../services/auth'
import BaseHeading from '../components/BaseHeading.vue'

const editData = ref({
    photo: null,
    photoPreview: null,
})

const loading = ref(false)

// el mensaje de exito se va a estar en la siguiente variable
const successMessage = ref("")

async function handleSubmit() {
    
    // preguntamos que si ya está cargando, que no haga nada. Esto lo hacemos para que si se cliquea el btn no lo puedan volver a cliquear varias veces seguidas
    if(loading.value) return // si sigue cargando y apretan los manda al return de una así no se hacen muchas peticiones al pepe

    loading.value = true

    try {
        await editMyProfilePhoto(editData.value.photo)
    } catch (error) {
        console.error("Ocurrió un error al intentar editar perfil: ", error)
    }

    successMessage.value = "¡Se actaulizó la foto de perfil con éxito!"
    loading.value = false
}

async function handleFileSelection(ev) {
    successMessage.value = ""

    editData.value.photo = ev.target.files[0]
    // console.log("Archivo", editData.value.photo)

    // Ahora que contamos con el File, vamos a leerlo para poder hacer la previsualización
    // Con este objetivo en mente instanciamos la clase FileReader. FileReader es una clase propia de JS que permite leer archivos
    const reader = new FileReader()

    reader.addEventListener('load', function(){
        // guardamos el resultado de la lectura
        editData.value.photoPreview = reader.result // en la propiedad 'result' del reader nosotros vamos a tener lo que se haya leído
        console.log(editData.value.photoPreview)
    })

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