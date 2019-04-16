import React from 'react';

const Header = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getToday = () => {
        const today = new Date();
        return `${monthNames[today.getMonth()]} ${today.getDay() + 1}, ${today.getFullYear()}`
    };

    return (
        <div>
            <h1>Word of the Day for {getToday()}</h1>
        </div>
    );
}

export default Header;