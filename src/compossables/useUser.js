import { onMounted, ref } from "vue"
import { getUserProfileByID } from "../services/user-profile"

export function useUser(id) {
    // en esta variable guardamos todos los datos del usuario del cual se está viendo el perfil
    const user = ref({
        id: null,
        email: null,
        displayName: null,
        photoURL: null,
        bio: null,
    })

    const loading = ref(false)
    onMounted(async () => {
        // Cuando monte queremos que traiga los datos del usuario

        loading.value = true
        user.value = await getUserProfileByID(id)
        loading.value = false

    })

    return { // retornamos el usuario y el esatdo de carga
        user,
        loading
    }
}