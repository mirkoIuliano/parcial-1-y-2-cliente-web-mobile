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
                :alt="`Foto de perfil de ${user.displayName}`"
                class="w-64 h-64 object-cover border rounded-full"
            >
        </div>
        <div>
            <p class="font-bold mb-1 text-xl">{{ user.displayName || "" }}</p>
            <p class="mb-1 text-cyan-800 font-medium">{{ user.email }}</p>
            <p class="mb-1">{{ user.bio || "" }}</p>
        </div>
    </div>
</template>