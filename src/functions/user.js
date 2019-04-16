import database from '../firebase/firebase';

export const getUserIndex = async (userUID) => {
    const accountsArray = await database.ref('accounts').once('value')
        .then((snapshot) => {
            return snapshot.val();
        })
        .catch((e) => {
            console.log('Error in retrieving accounts array.', e);
        });

    for (let i = 0; i < accountsArray.length; i++) {
        if (accountsArray[i].uid.localeCompare(userUID) === 0) {
            return i;
        }
    }
};

export const getAccountsArray = async () => {
    return await database.ref('accounts').once('value')
        .then((snapshot) => {
            return snapshot.val();
        })
        .catch((e) => {
            console.log('Error in retrieving previous accounts.', e);
        });
};