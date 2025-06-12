// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDVxxWqaXYQm_Cf3oevtUVb_XRlII4utjQ",
  authDomain: "fir-fta.firebaseapp.com",
  projectId: "fir-fta",
  storageBucket: "fir-fta.firebasestorage.app",
  messagingSenderId: "738594340757",
  appId: "1:738594340757:web:52051c1a3909eb16cd409c",
  measurementId: "G-ZV91VRCZL2"
};

const app = initializeApp(firebaseConfig);

// Chỉ khởi tạo analytics nếu đang chạy trên client (có window)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

export default app;