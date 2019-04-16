import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import database, { firebase } from './firebase/firebase';
import AppRouter, { history } from './routers/AppRouter';
import configureStore from './store/configureStore';
import { updateUser } from './actions/user';
import { getAccountsArray } from './functions/user';

export const store = configureStore();
const jsx = (
    <Provider store={store}>
        <AppRouter />
    </Provider>
);

ReactDOM.render(jsx, document.getElementById('root'));

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        //Check if user exists in the database.
        //If they don't, add them before loading user to the redux store.
        if (!(await checkUserInDatabase(user.uid))) {
            addUserToDatabase(user);
        }

        //Load user to redux store.
        await store.dispatch(updateUser({ user, isAuthenticated : true }));

    } else {
        //Dispatch updateUser with isAuth as false: it should clear out user to null and have isAuth to false.
        history.push('/');
        store.dispatch(updateUser({ isAuthenticated : false }));
    }
});

const addUserToDatabase = async (user) => {
    let newAccount = [
        {
            name: user.displayName,
            uid: user.uid
        }
    ];

    //Obtain existing accounts array from database.
    const accountsInDB = await getAccountsArray();
    if (accountsInDB) {
        newAccount = newAccount.concat(...accountsInDB);
    }

    await database.ref('accounts/').update(newAccount)
        .then(() => {
            console.log('Succesfully added new user to database.');
        })
        .catch((e) => {
            console.log('Error in adding user to database.', e);
        });
};

const checkUserInDatabase = async (uid) => {
    return await database.ref('accounts').orderByChild('uid').equalTo(uid).once('value')
        .then((snapshot) => {
            return snapshot.exists();
        })
        .catch((e) => {
            console.log('Error checking user existence.', e);
        });
};