const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDADMHB7YJ7Uk-5gTG0-ltcOqzz9EPsPpE",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "reservation-58141.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "reservation-58141",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "reservation-58141.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1054025291697",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1054025291697:web:a4dde7aa5151465e62cf90",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ECTK2LM7Y3"
};

const backendAPI = import.meta.env.VITE_BACKEND_API || "http://localhost:3333/api/v1";

export {
    firebaseConfig,
    backendAPI
}