import React from 'react';
import {BrowserRouter,Switch,Route} from 'react-router-dom';
import "./styles/global.css";
import "react-datepicker/dist/react-datepicker.css";
import RestrictedRoute from './utils/restrictedRoute.js';
import Login from './pages/login.js';
import Dashboard from './pages/dashboard.js';

export default class Router extends React.Component{
  render(){
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={Login} />
          <RestrictedRoute path='/dashboard' component={Dashboard} />
        </Switch>
      </BrowserRouter>
    );
  }
}