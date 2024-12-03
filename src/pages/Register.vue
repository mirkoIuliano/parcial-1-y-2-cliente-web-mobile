<script setup>
import { ref } from 'vue';
import { register } from '../services/auth';
import { useRouter } from 'vue-router'

const router = useRouter()

const newUser = ref({
    email: '',
    password: '',
})

// esta variable sirve para ser un estado de carga
const loading = ref(false)


async function handleSubmit(){
    // handleSubmit va a llamar a una función register() de [auth.js]

    loading.value = true
    try {
        await register({...newUser.value}) // llamamos a la función register() y le pasamos un objeto con los datos del newUser (osea los datos ingresados en el fomrulario)
    } catch (error) {
        console.error("[Register handleSubmit] Error al registrarse: ", error)
        // TODO: Manejar el error y mostrar un feedback
    }

    // si se logua correcatamente lo enviamos a la página de publicaciones
    router.push('/mi-perfil')
}

</script>

<template>

    <h2 class="text-5xl">Crear Cuenta</h2>
    
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
    <button type="submit" class="w-full bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 transition-colors duration-200">Crear Cuenta</button>

    </form>
</template>