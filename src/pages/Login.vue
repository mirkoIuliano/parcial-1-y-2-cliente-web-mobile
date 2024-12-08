<script setup>
import { ref } from 'vue'
import { login } from '../services/auth'
import { useRouter } from 'vue-router'
import BaseHeading from '../components/BaseHeading.vue'

const router = useRouter()

const user = ref({
    email: '',
    password: '',
})

// esta variable sirve para ser un estado de carga
const loading = ref(false)

// el mensaje de error va a estar en la siguiente variable
const errorMessage = ref('')

async function handleSubmit(){
    errorMessage.value = ""
    // handleSubmit va a llamar a la función login() de [auth.js]
    loading.value = true
    try {
        await login({...user.value}) // llamamos a la función login() y le pasamos un objeto con los datos del user (osea los datos ingresados en el fomrulario)
    } catch (error) {
        errorMessage.value = "El correo electrónico o la contraseña proporcionados son incorrectos"
        loading.value = false
        console.error("[Login.vue handleSubmit()] Error al autentificar: ", error)
    }
    // si se logua correcatamente lo enviamos a la página de su perfil para que lo edite si lo desea
    router.push('/mi-perfil')
}

</script>

<template>

    <BaseHeading>Iniciar Sesión</BaseHeading>
    
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

    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="text-red-500 mb-4">
        {{ errorMessage }}
    </div>

    <button type="submit" class="w-full bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 focus:bg-slate-700 transition-colors duration-200">{{ !loading ? "Ingresar" : "Iniciando sesión..." }}</button>

    <p class="mt-4 text-slate-600">¿No tienes cuenta? <router-link class="text-cyan-700 font-medium" to="/registrarse">Regístrate</router-link></p>

    </form>
</template>