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
    <div class="m-auto">
        <div>
            <img 
                :src="user.photoURL || NoPhoto" 
                alt=""
                class="w-64 h-64"
            >
            <!-- En vez de usar como componente (NoPhoto) podemos llamar a la foto directamente así:
            <img 
                :src="user.photoURL || '/imgs/no-photo.png'" 
            >
            -->
        </div>
        <div>
            <p class="font-bold mb-1 text-xl">{{ user.displayName || "" }}</p>
            <p class="mb-1">{{ user.bio || "Todavía no tiene biografía..." }}</p>
            <p class="mb-1">{{ user.email }}</p>
        </div>
    </div>

    <div class="flex gap-4 items-start">
    </div>
</template>