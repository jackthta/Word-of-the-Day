import React from 'react';

import Word from './Word';
import Pronunciation from './Pronunciation';
import PartOfSpeech from './PartOfSpeech';
import Definition from './Definition';
import Example from './Example';

const WordCard = ({ word, pronunciation, partOfSpeech, definition, examples, generated, hadSavedWord = true, saveWordToUser = ()=>{}, isMain = false, userUID = false }) => {
    return (
        <div>
            <Word word={word} />
            <Pronunciation pronunciation={pronunciation} />
            <PartOfSpeech partOfSpeech={partOfSpeech} />
            <Definition definition={definition} />
            <Example examples={examples} />
            { (isMain && !!userUID) &&
                <button disabled={hadSavedWord} onClick={saveWordToUser.bind(this, { word, pronunciation, partOfSpeech, definition, examples, generated })}>Save this word</button>
            }
        </div>
    );
};

export default WordCard;