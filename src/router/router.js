// Archivo de creación y configuración del Router
import { createRouter, createWebHashHistory } from "vue-router"
import Home from '../pages/Home.vue'
import PostsPage from '../pages/PostsPage.vue'
import CreatePostForm from '../pages/CreatePostForm.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import MyProfile from "../pages/MyProfile.vue"
import MyProfileEdit from "../pages/MyProfileEdit.vue"
import MyProfileEditPhoto from "../pages/MyProfileEditPhoto.vue"
import UserProfile from "../pages/UserProfile.vue"
import PrivateChat from "../pages/PrivateChat.vue"
import EditPost from "../pages/EditPost.vue"
import { subscribeToAuthChanges } from "../services/auth"
// importamos subscribeToAuthChanges para poder saber si el usuario está o no autenticado (esto lo sabemos con subscribeToAuthChanges y sus observers)
// import { subscribeToAuthChanges } from "../services/auth";

// Definimos las rutas
// En vue-router, uno trabaja con un arhicvo de configración de rutas. Creamos un array de objetos de ruta. Estos objeto deberían tener al menos 2 propiedades: path (ruta) y el componente que queremos asociar
const routes = [
    {
        path:'/', 
        component: Home,
    },
    {
        path:'/publicaciones', 
        component: PostsPage,
        // agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
    {
        path:'/publicaciones/editar/:id', 
        component: EditPost,
        // agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
    {
        path:'/publicaciones/crear-publicacion', 
        component: CreatePostForm,
        // agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
    {
        path:'/iniciar-sesion', 
        component: Login,
    },
    {
        path:'/registrarse', 
        component: Register,
    },
    {
        path:'/mi-perfil', 
        component: MyProfile,
        // agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
    {
        path:'/mi-perfil/editar', 
        component: MyProfileEdit,
        // agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
    {
        path:'/mi-perfil/editar/foto', 
        component: MyProfileEditPhoto,
        // agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
    {
        path:'/usuario/:id', 
        component: UserProfile,
        // agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
    {
        path:'/usuario/:id/chat', 
        component: PrivateChat,
        // agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
];


// Con esto podemos usar el createRouter para crear nuestro router
const router = createRouter( // createRouter() recibe un objeto con, por lo menos, dos propiedades que le vamos a querer declarar: rutas y history
    { 
        routes, 
        history: createWebHashHistory(), 
    }
)


// Nos suscribimos a los datos del usuario autenticado
let loggedUser = {
    id: null,
    email: null,
    displayName: null,
    bio: null,
}

// Creo que llamamos acá para poder ver si el usuario está autenticado o no y con esto permitir o no la navegación a cieras rutas
subscribeToAuthChanges(newUserData => loggedUser = newUserData)

// Agregamos que en cada navegación de ruta se verifique si la ruta requiere autenticación, y de así serlo, verifique si el usuario está autenticado. De no estarlo, lo mandamos al login.
router.beforeEach( // vamos a usar la función beforeEach(), que se ejecuta antes de cada navegación de ruta. beforeEach() me pasa los objetos de la ruta a la que voy (to) y a la que vengo (from)
    (to, from) => {
        // console.log("Verificando si el usuario tiene acceso a esta ruta: ", to)
        if (to.meta.requireAuth /* si la ruta a la que quiero entrar tiene como atributo meta requireAuth en true */ && loggedUser.id === null /* y el id del usuario autenticado es null (osea que no hay un usuario autenticado) */) {
            return { // entonces lo retornamos a inicar-sesion
                path: '/iniciar-sesion'
            }
        }

})


// exportamos el router
export default router