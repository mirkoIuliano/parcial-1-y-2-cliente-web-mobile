// Como todo archivo de configuración, tenemos que exportar un objeto de configuración
// este tipo de archivos siempre terminan haceindo un export default del objeto
// Lo que el objeto contiene depende de la configración del proyecto

// Importamops el plugin de Vue que queremos refistrar
import vue from '@vitejs/plugin-vue'

export default {
    // Ahora registramos el plugin usando la propiedad 'plugins', que recibe un array de los plugin
    plugins: [vue()]
}