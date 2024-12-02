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
    <div class="flex gap-4 items-start">
        <div class="w-1/6 bg-slate-400">
            <img 
                :src="user.photoURL || NoPhoto" 
                alt=""
            >
            <!-- En vez de usar como componente (NoPhoto) podemos llamar a la foto directamente así:
            <img 
                :src="user.photoURL || '/imgs/no-photo.png'" 
                alt=""
            >
            -->
        </div>
        <div>
            <div class="mb-4">{{ user.bio || "Acá va mi biografía..." }}</div>
            <dl>
                <dt class="font-bold">Email</dt>
                <dd class="mb-3">{{ user.email }}</dd>
                <dt class="font-bold">Nombre de Usuario</dt>
                <dd class="mb-3">{{ user.displayName || "No especificado..." }}</dd>
            </dl>
        </div>
    </div>
</template>