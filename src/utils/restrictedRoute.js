import React from 'react';
import {Route,Redirect} from 'react-router-dom';
import store from './store.js';

const RestrictedRoute = ({component : Component,...rest}) => {
    return (
        <Route {...rest} render={props => (
            store.getState().dataset ?
                <Component {...props} /> :
                <Redirect to='/' />
        )} />
    )
}

export default RestrictedRoute;