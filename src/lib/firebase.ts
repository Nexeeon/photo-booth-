import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBJ5NoplaPegbGV_WnmuHG8odvxJCHsTo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "photobooth-6280b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "photobooth-6280b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "photobooth-6280b.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "212193711291",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:212193711291:web:6727b229232c7f2098859e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C94M28NWW4",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const firestore = db
export const database = getDatabase(app)
export default app
