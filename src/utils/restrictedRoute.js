import React from 'react';
import Cookies from 'js-cookie';
import {Route,Redirect} from 'react-router-dom';
import store from './store.js';

const RestrictedRoute = ({component : Component,...rest}) => {
    
    let cookie = Cookies.get('user');

    return (
        <Route {...rest} render={props => (
            cookie ? 
                <Component {...props} /> :
                <Redirect to='/' />
        )} /> 
    )
}

export default RestrictedRoute;