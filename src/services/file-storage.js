import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "./firebase"

/**
 * 
 * @param {string} path 
 * @param {File} file 
 */
export async function uploadFile(path, file) {

    // Al igual que con Firestore, para poder trabajar con un archivo en Storage, necesitamos crear la referencia. En este caso, usando la funrión "ref()" de Storage (no confundir con el "ref" de Vue)
    const fileRef = ref(storage, path) // le pasamos como primer parámetro la referencia al servicio Storage y como segundo la ruta donde queremos guardar la imagen

    // Con uploadBytes() la guardamos
    await uploadBytes(fileRef, file) // le pasamos la referencia a la ruta donde se debe guardar y el archivo

}

/**
 * 
 * @param {string} path
 * @returns {Promise<string>} 
 */
export async function getFileURL(path) {

    const fileRef = ref(storage, path)

    // Con getDownloadURL() obtenemos la URL de la imagen
    return await getDownloadURL(fileRef) // le pasamos la referencia de donde está la imagen

}