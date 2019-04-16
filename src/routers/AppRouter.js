import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import PrivateRoute from '../routers/PrivateRoute';
import WordOfTheDay from '../components/WordOfTheDay';
import NotFoundPage from '../components/NotFoundPage';
import Login from '../components/Login';
import SavedWords from '../components/SavedWords';

export const history = createBrowserHistory();

const AppRouter = () => (
    <Router history={history}>
        <div>
        <Route path ='/' component={Login} />
            <Switch>
                <Route path='/' component={WordOfTheDay} exact={true} />
                <PrivateRoute path='/saved-words' component={SavedWords} exact={true} />
                <Route component={NotFoundPage} />
            </Switch>
        </div>
    </Router>
);

export default AppRouter;