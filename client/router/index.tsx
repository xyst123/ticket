import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Main from '../pages/Main';
import Login from '../pages/Login';
import Ticket from '../pages/Ticket';

export const routes = [
  {
    path: '/',
    component: Main
  }, {
    path: '/login',
    component: Login,
  },{
    path: '/ticket',
    component: Ticket,
  }
]

export const Routes = () => (
  <Router routes={routes}>
    <Switch>
      {routes.map((route, index) => (
        <Route key={`route-${index}`} path={route.path} exact render={() => <route.component />} />
      ))}
    </Switch>
  </Router>
);



