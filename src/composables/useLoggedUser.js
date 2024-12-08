/* Este archivo tiene la funcionalidad de suscribirnos a los cambios de autenticación y así poder tener la variable loggedUser con los datos del usuario autenticado */
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
}