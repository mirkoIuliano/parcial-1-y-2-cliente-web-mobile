<!-- 
Este es un componente en el que está la foto de perfil del usuario y sus datos
-->
<script setup>
import NoPhoto from '/imgs/no-photo.png'

defineProps({
    user: {
        type: Object,
        required: true
    }
})


</script>

<template>
    <div class="m-auto max-w-96">
        <div class="flex justify-center my-2">
            <img
                :src="user.photoURL || NoPhoto" 
                class="w-64 h-64 object-cover border rounded-full"
            >
            <!-- En vez de usar como componente (NoPhoto) podemos llamar a la foto directamente así:
            <img 
                :src="user.photoURL || '/imgs/no-photo.png'" 
            >
            -->
        </div>
        <div>
            <p class="font-bold mb-1 text-xl">{{ user.displayName || "" }}</p>
            <p class="mb-1 text-cyan-800 font-medium">{{ user.email }}</p>
            <p class="mb-1">{{ user.bio || "" }}</p>
        </div>
    </div>
</template>