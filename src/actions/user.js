import { firebase, googleAuthProvider } from '../firebase/firebase';

export const updateUser = ({ user = {}, isAuthenticated = false} = {}) => {
    return {
        type : 'UPDATE_USER',
        user,
        isAuthenticated
    };
};

export const startLogin = () => {
    return () => {
        return firebase.auth().signInWithPopup(googleAuthProvider);
    };
};

export const startLogout = () => {
    return () => {
        return firebase.auth().signOut();
    };
};