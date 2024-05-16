// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUZzDn59QybFV3iduWhriy6ziqFuuTrWA",
    authDomain: "seiswatch-b4c2f.firebaseapp.com",
    databaseURL:
        "https://seiswatch-b4c2f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "seiswatch-b4c2f",
    storageBucket: "seiswatch-b4c2f.appspot.com",
    messagingSenderId: "998371569633",
    appId: "1:998371569633:web:00b1450e94a20dc8f72ca0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
module.exports = app;
