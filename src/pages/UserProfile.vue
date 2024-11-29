<script setup>
import { onMounted, ref } from 'vue';
import { getUserProfileByID } from '../services/user-profile';
import { useRoute } from 'vue-router';
import ProfileData from '../components/ProfileData.vue';

const route = useRoute()

// en esta variable guardamos todos los datos del usuario del cual se está viendo el perfil
const user = ref({
    id: null,
    email: null,
    displayName: null,
    photoURL: null,
    bio: null,
})

const loading = ref(false)

const id = route.params.id

onMounted(async () => {
    // Cuando monte queremos que traiga los datos del usuario
    
    loading.value = true
    user.value = await getUserProfileByID(route.params.id)
    loading.value = false

})

</script>

<template>
    <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Perfil de {{ user.displayName || user.email }}</h2>
    <ProfileData :user="user"/>
</template>