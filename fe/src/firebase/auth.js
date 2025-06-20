import { auth } from './firebase';
import { signOut, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from 'firebase/auth';

export const doSignInWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const doSendPasswordResetEmail = async (email) => {
    return sendPasswordResetEmail(auth, email);
}

export const doUpdatePassword = async (newPassword) => {
    updatePassword(auth.currentUser, newPassword);
}

export const doSignOut = async () => {
    localStorage.clear();
    return signOut(auth);
}
