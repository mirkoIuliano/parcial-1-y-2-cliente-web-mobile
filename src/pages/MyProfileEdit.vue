<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { editMyProfile, subscribeToAuthChanges } from '../services/auth';

// creamos "unsubscribeFromAuth" y la definimos como una función vacía (porque después vamos a igual "unsubscribeFromAuth" a una función)
let unsubscribeFromAuth = () => {}

const loading = ref(false)

const editData = ref({
    displayName: '',
    bio: '',
    career: '',
})

const handleSubmit = async () => {
    loading.value = true;
    
    try {
        await editMyProfile({...editData.value}) // llamamos a la función editMyProfile y le pasamos una copia de mi usuario autenticado
    } catch (error) {
        // TODO: Manejar el error y mostrar un mensaje de feedback
    }

    // cuando termine ponemos el loading en false de vuelta
    loading.value = false;
}

onMounted(()=> {
    // cuando monte queremos que traiga los datos del usuario autenticado para que en nuestro formulario de editar aparezcan los datos actuales, en vez de los input en blanco sin nada
    unsubscribeFromAuth = subscribeToAuthChanges(
        newUserData => editData.value = {
            displayName : newUserData.displayName || '', // este (|| '') lo puso en clase 8 min 41:30. 
            bio : newUserData.bio || '', // esto sirve para que, si no existe la bio, la career o el displayName, en vez de quedar como undefined queden como ''
            career : newUserData.career || '',
        })
    // subscribeToAuthChanges retorna como resultado una función para cancelar la suscripción. Esta función se va a guardar en unsubscribeFromAuth, osea que dentro de unsubscribeFromAuth va a tener la función para desuscrirse 
})

onUnmounted(() => {
    unsubscribeFromAuth()
})

</script>

<template>
    <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Editar Mi Perfil</h2>

    <form 
        action="#"
        @submit.prevent="handleSubmit"
    >   
    <div class="mb-4">
        <label for="bio" class="block mb-2">Biografía</label>
        <textarea 
            id="bio" 
            class="p-2 min-h-10 w-full border rounded read-only:bg-gray-200" 
            :readonly="loading"
            v-model="editData.bio"
        ></textarea>
    </div>
    <div class="mb-4">
        <label for="displayName" class="block mb-2">Nombre de Usuario</label>
        <input 
            type="text" 
            id="displayName" 
            class="p-2 w-full border rounded read-only:bg-gray-200"
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
    <div class="mb-4">
        <label for="career" class="block mb-2">Carrera</label>
        <input 
            type="text" 
            id="career" 
            class="p-2 w-full border rounded read-only:bg-gray-200"
            :readonly="loading"
            v-model="editData.career"
        >
    </div>

    <button type="submit">
        <!-- esto lo hacemos para mostrar que, mientras se esté grabando aparezca Grabando... y cuando termine/no esté grabando "Guardar Cambios" -->
        {{ !loading ? "Guardar Cambios" : "Grabando..." }}
    </button>

    </form>
</template>