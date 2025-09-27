import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "demo-skillmitra-key",
  authDomain: "localhost",
  projectId: "skillmitra-demo",
  storageBucket: "skillmitra-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-skillmitra-app",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)

if (typeof window !== "undefined") {
  // Only connect to emulators if not already connected
  try {
    // Check if auth emulator is already connected
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    }
  } catch (error) {
    // Emulator already connected or not available
    console.log("[v0] Auth emulator already connected or not available")
  }

  try {
    // Check if Firestore emulator is already connected
    if (!db._delegate._settings?.host?.includes("localhost:8080")) {
      connectFirestoreEmulator(db, "localhost", 8080)
    }
  } catch (error) {
    // Emulator already connected or not available
    console.log("[v0] Firestore emulator already connected or not available")
  }
}

export default app
