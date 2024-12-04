<script setup>
import { onMounted, ref } from 'vue';
import { logout, subscribeToAuthChanges } from './services/auth';
import { useRouter } from 'vue-router';
import Logo from '/imgs/logo.png'

// vamos a obtener la instancia del router usando la función useRouter
const router = useRouter()

// creamos una variable donde vamos a obtener los datos del usuario autenticado (si es que existe)
const loggedUser = ref ({
    id: null,
    email: null,
})


onMounted(()=> {
    subscribeToAuthChanges(newUserData => loggedUser.value = newUserData)
})
    

function handleLogout(){
    logout()
    router.push('/iniciar-sesion') // usamos el método push para redireccionar a /iniciar-sesion
}
</script>

<template>

    <nav class="flex justify-between items-center p-4 border">
        <router-link to="/">
            <div class="flex items-center">
                <div>
                    <img :src="Logo" alt="Logo" class="min-w-10 min-h-10 mr-2">
                </div>
                <div>
                    <h1 class="text-2xl font-semibold"> Coppermind </h1>
                </div>
            </div>
        </router-link>

        <ul class="flex gap-4 items-center text-lg font-normal text-slate-500">
            <li><router-link class="block py-1 px-4 hover:bg-slate-100 transition-colors duration-200 rounded-md" to="/">Home</router-link></li>
            
            <!-- usamos v-if para hacer la verificación de si está o no el usuario con una sesión iniciada -->
            <template v-if="loggedUser.id !== null"> <!-- si loggedUser.id es distinto a null vamos a mostrar el Chat y Mi Perfil -->
                <li><router-link class="block py-1 px-4 hover:bg-slate-100 transition-colors duration-200 rounded-md" to="/publicaciones">Publicaciones</router-link></li>
                <li><router-link class="block py-1 px-4 hover:bg-slate-100 transition-colors duration-200 rounded-md" to="/mi-perfil">Mi Perfil</router-link></li>
                <li>
                    <form action="#" @submit.prevent="handleLogout" class="block py-1 px-4 hover:bg-slate-100 transition-colors duration-200 rounded-md">
                        <button type="submit" >{{ loggedUser.email }} (Cerrar Sesión)</button>
                    </form>
                </li>
            </template>
            <!-- si no está -->
            <template v-else>
                <li><router-link class="block py-1 px-4 hover:bg-slate-100 transition-colors duration-200 rounded-md" to="/iniciar-sesion">Iniciar Sesión</router-link></li>
                <li><router-link class="block py-1 px-4 hover:bg-slate-100 transition-colors duration-200 rounded-md" to="/registrarse">Crear Cuenta</router-link></li>
            </template>
        </ul>

    </nav>

    <main class="p-4">
        <!-- tenemos que usar el componente de router-view, que indica dónde el compontente se tiene que renderizar -->
        <router-view></router-view>
    </main>

    <footer class="flex justify-center items-center bg-slate-800 text-white h-25">
        <p>Mirko Iuliano | Copyright © Da Vinci 2024</p>
    </footer>

</template>

<style>
/* dentro de style acá va toda la estilización del componente  */

</style>