<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { subscribeToAuthChanges } from '../services/auth';

// creamos "unsubscribeFromAuth" y la definimos como una función vacía (porque después vamos a igual "unsubscribeFromAuth" a una función)
let unsubscribeFromAuth = () => {}

const loggedUser = ref({
    id: null,
    email: null,
    displayName: null,
    bio: null,
    career: null,
})

onMounted(() => {
    // cuando se monte queremos llamar al subscribeToAuthChanges
    unsubscribeFromAuth = subscribeToAuthChanges(newUserData => loggedUser.value = newUserData)
    // subscribeToAuthChanges retorna como resultado una función para cancelar la suscripción. Esta función se va a guardar en unsubscribeFromAuth, osea que dentro de unsubscribeFromAuth va a tener la función para desuscrirse 
})

onUnmounted(() => {
    // Cuando se desmonte vamos a cancelar la suscripción
    unsubscribeFromAuth()
})

</script>

<template>
    <div class="flex items-end gap-4">
        <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Mi Perfil</h2>
        <router-link 
            to="/mi-perfil/editar"
            class="mb-4 text-blue-700 underline"
        >Editar</router-link>
    </div>

    <div class="mb-4">{{ loggedUser.bio || "Acá va mi biografía..." }}</div>
    
    <dl>
        <dt class="font-bold">Email</dt>
        <dd class="mb-3">{{ loggedUser.email }}</dd>
        <dt class="font-bold">Nombre de Usuario</dt>
        <dd class="mb-3">{{ loggedUser.displayName || "No especificado..." }}</dd>
    </dl>
    <!-- 
        La idea es que queremos que de cada usuario pueda especificar, a parte del email, un nombre de usuario, una biografía y una carreara. Como displayName, bio y career son datos opcionales le ponemos un default por si este dato no existe  
    -->
</template>