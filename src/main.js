import './style.css';
import App from './App.vue' // importamos el componente App, que es el compoentne que queremos usar como componente raíz
import { createApp } from 'vue'; // importamos la función createApp para poder crear la aplicación
import router from './router/router';

const app = createApp(App) // con esta función creamos la aplicación. Pero la crea en memoria nada más, no la vamos a ver reflejada en ningún lado todavía
// para verla reflejada tenemos que decirle a Vue dónde queremos que monte esta aplciación

// registramos el router en nuestra aplicación
app.use(router) // esto es importante porque nos registra globalmente alguna de las funciones de composición como useRouter y useRoute, que vamos a usar para manipular el router o las rutas desde los componentes. También habilita los compoentnes de RouterLink y RouterView

app.mount('#app') // con el método mount le decimos dónde queremos que monete la aplicación
// le pasamos el id de un elemento. En index.html tenemos <div id="app"></div>


