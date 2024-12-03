<script setup>
import { ref } from 'vue';
import { register } from '../services/auth';
import { useRouter } from 'vue-router'
import BaseHeading from '../components/BaseHeading.vue'

const router = useRouter()

const newUser = ref({
    email: '',
    password: '',
})

const repeatedPassword = ref('')

// esta variable sirve para ser un estado de carga
const loading = ref(false)

// el mensaje de error va a estar en la siguiente variable
const errorMessage = ref('');

async function handleSubmit(){
    // primero validamos que las contraseñas coincidan
    if (newUser.value.password !== repeatedPassword.value) {
        errorMessage.value = 'Las contraseñas ingresadas no son idénticas';
        return
    }

    if(newUser.value.password.length < 6){
        return errorMessage.value = 'La contraseña debe tener un mínimo de 6 caracteres';
    }

    loading.value = true
    try {
        await register({...newUser.value}) // llamamos a la función register() y le pasamos un objeto con los datos del newUser (osea los datos ingresados en el fomrulario)
    } catch (error) {
        console.error("[Register handleSubmit] Error al registrarse: ", error)
        return errorMessage.value = "Ocurrió un error al intentar registrarse. Por favor intentar de nuevo"
    }

    // si se logua correcatamente lo enviamos a la página de publicaciones
    router.push('/mi-perfil')
    loading.value = false
}
</script>

<template>

    <BaseHeading>Crear Cuenta</BaseHeading>
    
    <form 
        action="#"
        @submit.prevent="handleSubmit"
        class="w-2/4 border border-slate-300 p-8 rounded-lg shadow-lg bg-white m-auto my-8"
    >

    <div class="mb-4">
        <label for="email" class="block mb-2">Email</label>
        <input 
            type="email" 
            id="email" 
            class="p-2 w-full border rounded"
            v-model="newUser.email"
        >
    </div>
    
    <div class="mb-4">
        <label for="password" class="block mb-2">Contraseña</label>
        <input 
            type="password" 
            id="password" 
            class="p-2 w-full border rounded"
            v-model="newUser.password"
        >
    </div>

    <div class="mb-4">
        <label for="repeatedPassword" class="block mb-2">Repite la contraseña</label>
        <input 
            type="password" 
            id="repeatedPassword" 
            class="p-2 w-full border rounded"
            v-model="repeatedPassword"
        >
    </div>

    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="text-red-500 mb-4">
        {{ errorMessage }}
    </div>

    <button type="submit" class="w-full bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 transition-colors duration-200"
    >{{ !loading ? "Registrarse" : "Creando cuenta..."}}</button>

    </form>
</template>