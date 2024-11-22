/** @type {import('tailwindcss').Config} */
export default {
  // "content" debe llevar una lista de rutas de archivos que Tailwind debe "observar" para detectar las clases que usamos 
  content: [
    // en un proyecyo de Vite vamos a tener que poner 2 rutas:
    "./index.html", // va con './' porque lo estamos buscando en la misma carpeta que el archivo de tailwind.config.js
    // además vamos a pedir que podamos observar todos los arhciovs .vue, .js que estén dentro de /src o dentro de una de sus subcarpetas:
    "./src/**/*.{vue,js,jsx,ts,tsx}", // de esta forma incluimos todos los arhicovs que tengan como extensión vue,js,jsx,ts,tsx, sin importar su nombre (esto está indicado por el '*.{}'), que están dentro de la carpeta "/src" (./src/) o en clqr de sus subcarpetas (**/) 
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        'layout': '64px 1fr 100px',
      },
    },
  },
  plugins: [],
}

