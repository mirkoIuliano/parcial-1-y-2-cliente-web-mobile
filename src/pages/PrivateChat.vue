<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUser } from '../compossables/useUser';
import { useLoggedUser } from '../compossables/useLoggedUser';
import { savePrivateChatMessage, subscribeToPrivateChatMessages } from '../services/private-chat';
import { formatDate } from '../helpers/date';
import BaseHeading from '../components/BaseHeading.vue';

const route = useRoute()

// primero vamos a necesitar guardar los datos del perfil del usuario autenticado
const { loggedUser } = useLoggedUser() // así que llamamos a useLoggedUser, que devuelve un objeto con el usuario autenticado y lo guardamos en loggedUser

// por otro lado los datos del usuario con el que estoy chateando
const { user, loading : loadingUser} = useUser(route.params.id) // usamos useUser(id) que retorna el user y el estado de carga
            // con loading : loadingUser hacemos un destructuring y hacemos que el valor loading se guarde en la varaible 'loadingUser'

// necesitamos también la lista de mensajes del chat
const messages = ref ({})
// y si están cargando
const loadingMessages = ref ({})

// Por último necesitamos los datos de un nuevo mensaje
const newMessage = ref({
    text: ''
})

onMounted(async ()=> {
    loadingMessages.value = true
    // cuando se monte nos suscribimos a los cambios del chat privado
    subscribeToPrivateChatMessages(
        // el primer parametro es el id del usuario autetnticado
        loggedUser.value.id,
        // el segundo es el id del usuario con el que chateo
        route.params.id,
        // el tercero es el callback
        newMessages => { 
            messages.value = newMessages
            loadingMessages.value = false
        } 
    )
})

async function handleSubmit() {
    try {
        await savePrivateChatMessage(
            // primer parametro es el id del usuario autetnticado
            loggedUser.value.id,
            // el segundo es el id del usuario con el que chateo
            user.value.id,
            // el tercero es el mensaje
            newMessage.value.text,
        )
        // por ultimo borramos el input del mensaje
        newMessage.value.text = ''
    } catch (error) {

        console.log("Error", error)
    }
}

</script>

<template>
    <BaseHeading>Chat Privado con {{user.displayName || user.email}}</BaseHeading>

    <section class="mb-4">
        <h2 class="sr-only">Mensajes</h2>

        <div class="min-h-[300px] p-4 border rounded">
            <ul class="flex flex-col items-start gap-2">
                <li 
                    v-for="message in messages"
                    class="p-4 rounded"
                    :class="{
                        // dependiendo del id del usuario autenticado se pone uno u otro estilo
                        'bg-gray-200': loggedUser.id !== message.user_id, // si el id del usuario autenticado es diferente al user_id del mensaje significa que el mensaje lo envió la otra persona
                        'bg-green-200 self-end': loggedUser.id === message.user_id, // si son iguales siginifca que lo mandó el usuario autenticado
                        // 'bg-green-200': loggedUser.id === message.user_id,
                        // 'self-end': loggedUser.id === message.user_id,
                    }"
                >
                    <div>{{ message.text }}</div>
                    <div class="text-sm text-gray-700">{{ formatDate(message.created_at) || 'Enviando...' }}</div>
                </li>
            </ul>
        </div>
    </section>
    <form 
        action="#"
        class="flex items-stretch gap-4"
        @submit.prevent="handleSubmit"
    >
        <label for="text" class="sr-only">Mensaje</label>
        <textarea 
            id="text"
            class="w-full min-h-10 p-2 border rounded"
            v-model="newMessage.text"
        ></textarea>
        <button class="ml-2 bg-slate-800 text-white px-4 py-1 rounded-md font-medium text-base hover:bg-slate-700 focus:bg-slate-700 transition-colors duration-200" type="submit">Enviar</button>
    </form>
</template>