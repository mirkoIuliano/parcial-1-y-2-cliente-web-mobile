<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { editMyProfile, subscribeToAuthChanges } from '../services/auth';
import BaseHeading from '../components/BaseHeading.vue';

// creamos "unsubscribeFromAuth" y la definimos como una función vacía (porque después vamos a igual "unsubscribeFromAuth" a una función)
let unsubscribeFromAuth = () => {}

const loading = ref(false)

const editData = ref({
    displayName: '',
    bio: '',
})

// el mensaje de exito se va a estar en la siguiente variable
const successMessage = ref("")

// el mensaje de error va a estar en la siguiente variable
const errorMessage = ref('')

const handleSubmit = async () => {

    successMessage.value = ""

    /*---------- Validaciones ----------*/
    if (editData.value.displayName.length != 0 && editData.value.displayName.length < 3) {
        return errorMessage.value = "El nombre de usuario debe tener por lo menos 3 caracteres"
    }
    
    if (editData.value.displayName.length > 24) {
        return errorMessage.value = "El nombre de usuario puede tener como máximo 24 caracteres"
    }
    
    if (editData.value.bio.length != 0 && editData.value.bio.length < 5) {
        return errorMessage.value = "La biografía debe tener por lo menos 5 caracteres"
    }

    if (editData.value.bio.length > 240) {
        return errorMessage.value = "La biografía puede tener como máximo 240 caracteres"
    }
    /*---------- Fin de validaciones ----------*/

    // Preguntamos que si ya está cargando, que no haga nada. Esto lo hacemos para que si se cliquea el btn no lo puedan volver a cliquear varias veces seguidas
    if(loading.value) return; // Si sigue cargando y apretan los manda al return de una así no se hacen muchas peticiones al pepe
    
    loading.value = true;
    
    try {
        await editMyProfile({...editData.value}) // llamamos a la función editMyProfile y le pasamos un objeto con la copia de los datos que queremos editar
    } catch (error) {
        // TODO: Manejar el error y mostrar un mensaje de feedback
    }
    
    successMessage.value = "¡Se actaulizó la foto de perfil con éxito!"
    errorMessage.value = ""
    // cuando termine ponemos el loading en false de vuelta
    loading.value = false;
}

onMounted(()=> {
    // cuando monte queremos que traiga los datos del usuario autenticado para que en nuestro formulario de editar aparezcan los datos actuales, en vez de los input en blanco sin nada
    unsubscribeFromAuth = subscribeToAuthChanges(
        userData => editData.value = {
            displayName : userData.displayName || '', // este (|| '') lo puso en clase 8 min 41:30. 
            bio : userData.bio || '', // esto sirve para que, si no existe la bio o el displayName, en vez de quedar como undefined queden como ''
        })
    // subscribeToAuthChanges retorna como resultado una función para cancelar la suscripción. Esta función se va a guardar en unsubscribeFromAuth, osea que dentro de unsubscribeFromAuth va a tener la función para desuscrirse 
})

onUnmounted(() => {
    unsubscribeFromAuth()
})

</script>

<template>
    <BaseHeading>Editar Mi Perfil</BaseHeading>

    <form 
        action="#"
        @submit.prevent="handleSubmit"
        class="w-2/4 min-w-[500px] border border-slate-300 p-8 rounded-lg shadow-lg bg-white m-auto my-8"
    >
    <div class="mb-5">
        <label for="displayName" class="block mb-2 text-lg font-semibold text-slate-700">Nombre de Usuario</label>
        <input 
            type="text" 
            id="displayName" 
            class="px-4 py-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            :readonly="loading"
            v-model="editData.displayName"
        >
        <!-- EXPLICACIÓN DE ALGUNOS ATRIBUTOS:
            (:readonly="loading"):
                - es una propiedad que se puede poner en los inputs que sirve para que el input sea solo lectura (no se puede modificar el valor, copiar el valor, ni seleccionarlo)
            (class="read-only:bg-gray-200"):
                - read-only es un modificador de Tailwind, que hace que cuando el campo esté como 'readonly' le agregamos ese color de fondo
        -->
    </div>
    <div class="mb-5">
        <label for="bio" class="block mb-2 text-lg font-semibold text-slate-700">Biografía</label>
        <textarea 
            type="text"
            id="bio" 
            class="px-4 py-2 border border-slate-300 rounded-md w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            :readonly="loading"
            v-model="editData.bio"
        ></textarea>
    </div>

    <!-- Mensaje de error y de éxito -->
    <div v-if="errorMessage " class="text-red-500 mb-4">
        {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="text-green-600 font-medium mb-4">
        {{ successMessage }}
    </div>

    <button type="submit" class="w-full bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 focus:bg-slate-700 transition-colors duration-200">
        <!-- esto lo hacemos para mostrar que, mientras se esté grabando aparezca Grabando... y cuando termine/no esté grabando "Guardar Cambios" -->
        {{ !loading ? "Guardar Cambios" : "Grabando..." }}
    </button>
    </form>
</template>