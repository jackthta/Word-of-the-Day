import React from 'react';
import { connect } from 'react-redux';

import { startLogin, startLogout } from '../actions/user';
import { history } from '../routers/AppRouter';

const redirectToSavedWords = () => {
    history.push('/saved-words');
};

const redirectToHome = () => {
    history.push('/');
};

const Login = ({ isAuthenticated, startLogin, startLogout }) => {
    const isAuthenticatedTemplate = (
        <ul>
            <li><button onClick={redirectToHome}>Home</button></li>
            <li><button onClick={redirectToSavedWords}>My Saved Words</button></li>
            <li><button onClick={startLogout}>Sign Out</button></li>
        </ul>
    );

    const isNotAuthenticatedTemplate = (
        <button onClick={startLogin}>Sign In</button>
    );

    return (
        <div>
            {
                isAuthenticated ? 
                isAuthenticatedTemplate : 
                isNotAuthenticatedTemplate
            }
        </div>
    );
};

const mapStateToProps = (state) => ({
        isAuthenticated : state.isAuthenticated
});

const mapDispatchToProps = (dispatch) => ({
    startLogin : () => dispatch(startLogin()),
    startLogout : () => dispatch(startLogout())
});

const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login);

export default ConnectedLogin;