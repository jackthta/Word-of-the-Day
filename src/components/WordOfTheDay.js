import React from 'react';
import axios from '../../node_modules/axios/lib/axios';
import { connect } from 'react-redux';

import { getUserIndex, getAccountsArray } from '../functions/user';
import apiKey from '../private/apiKeys';
import database from '../firebase/firebase';
import WordCard from './WordCard/WordCard';
import Header from './Header';

export class WordOfTheDay extends React.Component {
    state = {
        word: undefined,
        pronunciation: undefined,
        partOfSpeech: undefined,
        definition: undefined,
        examples: undefined,
        generated: undefined,

        hadSavedWord: false,
        userUID: undefined
    }

    checkLastWordGen = async () => {
        let lastGen = await database.ref('lastGen').once('value')
            .then((snapshot) => {
                return snapshot.val();
            })
            .catch((e) => {
                console.log('Error in fetching lastGen.', e);
            });

        if (lastGen) {
            //Check if lastGen was another day.
            let today = new Date();
            const todayMonth = parseInt(today.getMonth());
            const todayDay = parseInt(today.getDate());
            lastGen = new Date(lastGen);
            const lastGenMonth = parseInt(lastGen.getMonth());
            const lastGenDay = parseInt(lastGen.getDate());

            //Check if months differ.
            if (todayMonth - lastGenMonth === 0) {
                //Check if dates differ.
                if (todayDay - lastGenDay === 0) {
                    //Last time generated was sometime today, load from firebase.
                    this.loadWordOfTheDay();
                } else {
                    //Last time generated was not TODAY. Generate new word.
                    this.generateWordOfTheDay();
                }
            } else {
                //Last time generated was not TODAY. Generate new word.
                this.generateWordOfTheDay();
            }
        } else {
            //lastGen has not been created, meaning that there needs a word of the day. Generate word.
            this.generateWordOfTheDay();
        }
    }

    generateWordOfTheDay = async () => {
        //API Authentication Credentials
        const appID = apiKey.OxfordAPI.appID;
        const appKey = apiKey.OxfordAPI.appKey;

        let urlConfig = {
            'proxy': 'https://cors-anywhere.herokuapp.com/',
            'endpoint': 'https://od-api.oxforddictionaries.com/api/v1/',
            'appID': appID,
            'appKey': appKey
        };

        let searchWord = await this.generateRandomWord(urlConfig);
        this.fetchWordFromAPI(urlConfig, searchWord);
    }

    generateRandomWord = async (urlConfig) => {
        //Generates random part of speech.
        const partsOfSpeech = ['noun', 'verb', 'adjective'];
        let randomNumber = Math.floor(Math.random() * partsOfSpeech.length);
        let lexicalCategory = partsOfSpeech[randomNumber];

        //Generate random prefix character. 'a' -> 'z'/
        //NOTE*: the min is INCLUSIVE, but the max is EXCLUSIVE. (max + 1) to include the max.
        const min = 97;
        const max = 122;
        randomNumber = Math.floor(Math.random() * ((max + 1) - min)) + min;
        let prefix = String.fromCharCode(randomNumber);

        const limit = 10;
        const url = `${urlConfig.proxy}${urlConfig.endpoint}wordlist/en/lexicalCategory%3D${lexicalCategory}?word_length=%3E2&prefix=${prefix}&exact=false&limit=${limit}`;

        //Async/await necessary to ensure the word gets generated and returned before the fetchWordFromAPI function fires.
        //Or else it'll search for 'undefined'.
        /*
        let response = await this.getRandomWord(urlConfig,url);
        response = response.data.results;
        let randomWord = response[Math.floor(Math.random() * response.length)].id;
        return randomWord;
        */

        //Testing purposes
        return 'test';
    }

    getRandomWord = async (urlConfig, url) => {
        return axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'app_id': urlConfig.appID,
                'app_key': urlConfig.appKey
            }
        }).then((response) => {
            return response;
        });
    }

    fetchWordFromAPI = async (urlConfig, searchWord) => {
        const url = `${urlConfig.proxy}${urlConfig.endpoint}entries/en/${searchWord}`;
        await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'app_id': urlConfig.appID,
                'app_key': urlConfig.appKey
            }
        })
            .then((response) => {
                response = response.data.results;

                if (
                    response[0].word === undefined || //word
                    response[0].lexicalEntries[0].pronunciations === undefined ||
                    response[0].lexicalEntries[0].pronunciations[0].phoneticSpelling === undefined || //pronunciation
                    response[0].lexicalEntries[0].lexicalCategory === undefined || //part of speech
                    response[0].lexicalEntries[0].entries[0].senses === undefined ||
                    response[0].lexicalEntries[0].entries[0].senses[0].definitions === undefined || //definition
                    response[0].lexicalEntries[0].entries[0].senses[0].examples === undefined  //examples
                ) {
                    this.generateWordOfTheDay();
                } else {
                    //All necessary information is defined.
                    this.storeWordInFirebase(response);
                }
            })
            .catch((e) => {
                console.log('Error fetching word. ', e);
            });
    }

    convertExamplesToArray = (examples) => {
        let examplesArray = [];
        for (let example of examples) {
            examplesArray.push(example.text);
        }
        return examplesArray;
    }

    storeWordInFirebase = async (response) => {
        const examplesArray = this.convertExamplesToArray(response[0].lexicalEntries[0].entries[0].senses[0].examples);

        //Set the state so the page can render the information.
        this.setState(() => {
            return {
                word: response[0].word,
                pronunciation: response[0].lexicalEntries[0].pronunciations[0].phoneticSpelling,
                partOfSpeech: response[0].lexicalEntries[0].lexicalCategory,
                definition: response[0].lexicalEntries[0].entries[0].senses[0].definitions[0],
                examples: examplesArray
            }
        });

        //Update firebase.
        const today = new Date();
        let firebaseStructure = {
            'lastGen': today.toLocaleDateString(),
            'words': [
                {
                    'generated': today.getTime(),
                    'word': this.state.word,
                    'pronunciation': this.state.pronunciation,
                    'partOfSpeech': this.state.partOfSpeech,
                    'definition': this.state.definition,
                    'examples': this.state.examples
                }
            ]
        }

        let prevWords = await database.ref('words').once('value')
            .then((snapshot) => {
                return snapshot.val();
            })
            .catch((e) => {
                console.log('Error in retrieving previous words. ', e);
            });
        if (prevWords !== null) {
            firebaseStructure.words.push(...prevWords);
        }

        database.ref().update(firebaseStructure)
            .then(() => {
                console.log('Successfully updated database.');
            })
            .catch((e) => {
                console.log('Error in updating database. ', e);
            })
    }


    loadWordOfTheDay = async () => {
        const prevData = await database.ref().once('value')
            .then((database) => {
                return database.val().words[0];
            })
            .catch((e) => {
                console.log('Something went wrong with retrieving the database. ', e);
            });

        this.setState(() => {
            return {
                word: prevData.word,
                'pronunciation': prevData.pronunciation,
                'partOfSpeech': prevData.partOfSpeech,
                'definition': prevData.definition,
                'examples': prevData.examples,
                generated: prevData.generated
            }
        });
    }

    saveWordToUser = async ({word, pronunciation, partOfSpeech, definition, examples, generated}) => {
        const userIndex = await getUserIndex(this.state.userUID);
    
        let currSavedWords = [
            {
                word,
                pronunciation,
                partOfSpeech,
                definition,
                examples,
                generated
            }
        ];
    
        //Check if user's saved_words array exists. Append all pre-existing saved words if so.
        const accountsInDB = await getAccountsArray();
        const savedWordsArray = accountsInDB[userIndex].saved_words;
        if (!!savedWordsArray) {
            currSavedWords = currSavedWords.concat(...savedWordsArray);
        }
    
        //Update user's saved_words array and lastTimeSavedWord.
        await database.ref(`accounts/${userIndex}`).update({ saved_words: currSavedWords, lastTimeSavedWord: currSavedWords[0].generated })
            .then(() => {
                console.log('Successfully saved word!');
            })
            .catch((e) => {
                console.log('Error in saving word.', e);
            });

        //Update hadSavedWord in state.
        this.setState(() => ({ hadSavedWord: true }));
    };
    
    hasSavedWord = async (userUID) => {
        const userIndex = await getUserIndex(userUID);
        let lastTimeSavedWord = await database.ref(`accounts/${userIndex}/lastTimeSavedWord`).once('value')
            .then((snapshot) => {
                return snapshot.val();
            });
        let lastGen = await database.ref('lastGen').once('value')
            .then((snapshot) => {
                return snapshot.val();
            });
        lastTimeSavedWord = new Date(lastTimeSavedWord);
        lastGen = new Date(lastGen);
    
        //Compare month, day, and year.
        if (
            (lastGen.getMonth() - lastTimeSavedWord.getMonth() === 0) &&
            (lastGen.getDate() - lastTimeSavedWord.getDate() === 0) &&
            (lastGen.getFullYear() - lastTimeSavedWord.getFullYear() === 0)
        ) {
            return true;
        } else {
            return false;
        }
    };


    render = () => (
        <div className='parent-container'>
            <Header />
            <WordCard
                word={this.state.word}
                pronunciation={this.state.pronunciation}
                partOfSpeech={this.state.partOfSpeech}
                definition={this.state.definition}
                examples={this.state.examples}
                generated={this.state.generated}
                hadSavedWord={this.state.hadSavedWord}
                saveWordToUser={this.saveWordToUser}
                isMain={true}
                userUID={this.state.userUID}
            />
        </div>
    );

    componentDidMount = async () => {
        this.checkLastWordGen();
    }

    componentDidUpdate = async () => {
        const hadSavedWord = await this.hasSavedWord(this.state.userUID);
        this.setState(() => ({ hadSavedWord }));
    };

    static getDerivedStateFromProps(nextProps) {
        return nextProps.user ? {
            userUID: nextProps.user.uid
        } : {}
      }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const ConnectedWordOfTheDay = connect(mapStateToProps)(WordOfTheDay);

export default ConnectedWordOfTheDay;