// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
  databaseURL: process.env.databaseURL,
};

const app = initializeApp(firebaseConfig);

// Chỉ khởi tạo analytics nếu đang chạy trên client (có window)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

export default app;