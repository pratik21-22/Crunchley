import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Check if Firebase is already initialized globally
const app = (globalThis as any).firebaseApp || initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
})

// Initialize Firebase Authentication and get a reference to the service
const auth = (globalThis as any).firebaseAuth || getAuth(app)

export { auth }
export default app