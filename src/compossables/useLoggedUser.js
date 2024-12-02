/*
Este archivo tiene la funcionalidad de suscribirnos a los cambios de autenticación y así poder tener la variable loggedUser con los datos del usuario autenticado

Como venimos repitiendo código para suscribirnos a los cambios de autenticación y poder tenre una variable con el usuario logueado, creamos una componente con una función componible que tenga esta funcionalidad y que podamos invocar en diferentes compoentenes

Le ponemos en el nombre de la función el mismo 'use' que también existe en funciones de Vue como useRouter, useRoute, etc
Por convención a las funciones componibles deberían empezar con 'use'. No es obligatorio, pero es una convención (en React, por ej, sí es obligatorio)

Para que una función sea consideraba como componible, necesita trabajar con algo del ciclo de vida de Vue. Osea, trabaj con ref, onMounted, onUnmounted, watch o clqr de otras funcionaliodades que Vue tiene
*/

import { onMounted, onUnmounted, ref } from "vue"
import { subscribeToAuthChanges } from "../services/auth"

export function useLoggedUser() {

    // creamos "unsubscribeFromAuth()" y la definimos como una función vacía. Esto lo hacemos porque después vamos a guardar en ella una función para desuscribirnos de los cambio de autenticación
    let unsubscribeFromAuth = () => { }

    const loggedUser = ref({
        id: null,
        email: null,
        displayName: null,
        photoURL: null,
        bio: null,
    })

    onMounted(async () => {
        unsubscribeFromAuth = subscribeToAuthChanges(newUserData => loggedUser.value = newUserData) // le pasamos un callback como parámetro. Como resultado vamos a recibir newUserData e igualamos loggedUser con este newUserData
        // subscribeToAuthChanges retorna como resultado una función para cancelar la suscripción. Esta función se va a guardar en unsubscribeFromAuth, osea que dentro de unsubscribeFromAuth va a tener la función para desuscrirse ==> lo vamos a usar para que cuando desmontemos el componente se desuscriba
    })

    onUnmounted(() => {
        // Cuando se desmonte vamos a cancelar la suscripción
        unsubscribeFromAuth()
    })

    // nos aseguramos que retorne los valores del usuario autenticado
    return {
        loggedUser
    } 
    // como es un solo valor podríamos hacer 
    // return loggedUser
    // pero lo dejamos así porque en un futuro vamos a devolver más de un valor en estas funciones componibles y es mejor que me acosumbre
}