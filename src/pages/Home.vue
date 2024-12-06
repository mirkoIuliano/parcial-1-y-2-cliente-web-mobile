<script setup>
import BaseHeading from '../components/BaseHeading.vue'
import { useLoggedUser } from '../compossables/useLoggedUser'

// Creamos una variable 'loggedUser', que guarde el resultado de la función componible useLoggedUser() de compossables 
const { loggedUser } = useLoggedUser()

</script>

<template>
    <section class="my-16">
        <div class="text-center max-w-3xl mx-auto">
            <BaseHeading class="text-5xl mb-6"> Bienvenido a <span class="text-cyan-800">Coppermind</span> </BaseHeading>

            <p class="text-lg text-slate-600">
                Conecta con otros amantes de la lectura, comparte reseñas de tus libros favoritos, y descubre nuevas
                historias para leer
            </p>

            <router-link 
                v-if="loggedUser.id == null"
                to="/registrarse" 
                class="mt-6 inline-block bg-cyan-700 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-cyan-800 focus:bg-cyan-800 transition-colors"
            > Crear Cuenta </router-link>
        </div>
    </section>

    <section class="py-16 px-8">
        <BaseHeading>¿Qué puedes hacer en Coppermind?</BaseHeading>
        
        <div class="flex flex-wrap justify-center gap-10">
            <div class="max-w-xs text-center">
                <h3 class="text-xl font-semibold text-cyan-950 mb-2">Publica Reseñas</h3>
                <p class="text-slate-600">
                    Escribe reseñas de los libros que has leído y compártelas con la comunidad
                </p>
            </div>

            <div class="max-w-xs text-center">
                <h3 class="text-xl font-semibold text-cyan-950 mb-2">Chat Privado</h3>
                <p class="text-slate-600">
                    Conectate con otros lectores a través del chat privado y comparte recomendaciones
                </p>
            </div>

            <div class="max-w-xs text-center">
                <h3 class="text-xl font-semibold text-cyan-950 mb-2">Personaliza tu Perfil</h3>
                <p class="text-slate-600">
                    Crea tu perfil y muestra tus últimas publicaciones
                </p>
            </div>
        </div>
    </section>

</template>