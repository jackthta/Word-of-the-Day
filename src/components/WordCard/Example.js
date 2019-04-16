import React from 'react';

const Example = ({examples} = props) => {
    return (
        <div>
        {
            examples && examples.map(
                (example, index) => {
                    return <p key={index}>{example}</p>
                }
            )
        }
        </div>
    );
};

export default Example;