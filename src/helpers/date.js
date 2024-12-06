/**
* 
* @param {Date|null} date
* @returns {string} La fecha con formato "DD/MM/AAAA hh:ii". Retorna null si date es null.
*/
export function formatDate(date){
    
    if(!date) return null // después cuando subamos un post vamos a poder poner 'Subiendo post...' gracias a esto

    // Vamos a formatear la fecha usando la clase Intl.DateTimeFormat() --> es nativo de JS
    const formatter = new Intl.DateTimeFormat('es-AR', 
    { // como segundo parámetro vamos a poder pasar un objeto de confiruación sobre el formato. Esto lo hacemos porque sino, si el número del día es de un solo dígito aparecería así: 1/10/2022. Con esta configuración aparecería como 01/11/2022
        day: '2-digit',
        month: '2-digit',
        year:'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // así le pedimos que no nos use el formato de p.m y a.m y que llegue hasta 24hs

    })

    // Usamos el formateador que creamos para darle la forma al Date
    return formatter.format(date).replace(',', '') // usamos replace para sacarle la coma y en su lugar no poner nada
                                    // sin replace se vería: 24/11/2024, 19:46
                                    // con replace se vería: 24/11/2024 19:46 (sin la coma en el medio)
}
