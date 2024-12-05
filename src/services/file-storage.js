import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "./firebase"

/**
 * 
 * @param {string} path 
 * @param {File} file 
 */
export async function uploadFile(path, file) {
    // Al igual que con Firestore, para poder trabajar con un archivo en Storage, necesitamos crear la referencia. En este caso, usando la funrión "ref" de Storage (no confundir con el "ref" de Vue)
    const fileRef = ref(storage, path)

    await uploadBytes(fileRef, file)
}

/**
 * 
 * @param {string} path
 * @returns {Promise<string>} 
 */
export async function getFileURL(path) {
    const fileRef = ref(storage, path)

    return await getDownloadURL(fileRef)
}