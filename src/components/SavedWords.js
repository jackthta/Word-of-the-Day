import React from 'react';

import { store } from '../app';
import { getAccountsArray, getUserIndex } from '../functions/user';
import WordCard from './WordCard/WordCard';

const getSavedWordsArray = async() => {
    const currStore = store.getState();
    const userUID = currStore.user.uid;

    const userIndex = await getUserIndex(userUID);
    const accountsArray = await getAccountsArray();

    if (accountsArray[userIndex].saved_words.length > 0) {
        return accountsArray[userIndex].saved_words;
    } else {
        return [];
    }
};

class SavedWords extends React.Component {
    state = {
        savedWordsArray: []
    };

    render = () => {
        return (
            <div>
                <h2>Saved Words</h2>

                {
                    this.state.savedWordsArray.map((value, index) => {
                        return <WordCard {...value} key={index} />
                    })
                }

            </div>
        );
    }

    componentDidMount = async () => {
        const savedWordsArray = await getSavedWordsArray();
        this.setState(() => ({
            savedWordsArray
        }));
    };
}

export default SavedWords;