<script setup>
import { useRoute } from 'vue-router';
import ProfileData from '../components/profile/ProfileData.vue';
import { useUser } from '../compossables/useUser';

const route = useRoute()

const id = route.params.id

const { user, loading } = useUser(id)

</script>

<template>
    <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Perfil de {{ user.displayName || user.email }}</h2>
    <ProfileData :user="user"/>
    <!-- link para ir a conversación privado con este usuario -->
     <router-link 
        :to="`/usuario/${user.id}/chat`"
        class="mr-4 font-semibold text-blue-800 hover:text-blue-600 transition-colors duration-200"
    > Conversación Privada con {{ user.displayName || user.email }}
    </router-link>
</template>