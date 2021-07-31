import React from 'react';
import {BrowserRouter,Switch,Route} from 'react-router-dom';
import "./styles/global.css";
import RestrictedRoute from './utils/restrictedRoute.js';
import Index from './pages/index.js';
import Dashboard from './pages/dashboard.js';

export default class Router extends React.Component{
  render(){
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={Index} />
          <RestrictedRoute path='/dashboard' component={Dashboard} />
        </Switch>
      </BrowserRouter>
    );
  }
}