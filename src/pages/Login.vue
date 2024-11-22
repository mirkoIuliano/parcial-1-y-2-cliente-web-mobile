<script setup>
import { ref } from 'vue';
import { login } from '../services/auth';


const user = ref({
    email: '',
    password: '',
})

// esta variable sirve para ser un estado de carga
const loading = ref(false)

async function handleSubmit(){
    // handleSubmit va a llamar a una función login, que está en el archivo [auth.js]
    loading.value = true
    try {
        await login({...user.value}) // llamamos a la función login() y le pasamos un objeto con los datos del user (osea los datos ingresados en el fomrulario)
    } catch (error) {
        console.error("[Login.vue handleSubmit()] Error al autentificar: ", error)
    }
}

</script>

<template>

    <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Iniciar Sesión</h2>
    
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
            v-model="user.email"
        >
    </div>
    
    <div class="mb-4">
        <label for="password" class="block mb-2">Contraseña</label>
        <input 
            type="password" 
            id="password" 
            class="p-2 w-full border rounded"
            v-model="user.password"
        >
    </div>
    <button type="submit" class="w-full bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 transition-colors duration-200">Ingresar</button>

    </form>
</template>