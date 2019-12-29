import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
} from 'react-router-dom';
import Loadable from 'react-loadable';

import Main from '@/pages/Main';
import Login from '@/pages/Login';
const Ticket= Loadable({
  loader: () => import('@/pages/Ticket'),
  loading:()=>(<div>Loading...</div>)
});

export const routes = [
  {
    path: '/main',
    component: Main
  }, {
    path: '/login',
    component: Login,
  }, {
    path: '/ticket',
    component: Ticket,
  }
]

export const Routes = () => (
  <Router routes={routes}>
    <Switch>
      <Route path='/' exact render={()=> (<Redirect to='/main'/>)}/>
      {routes.map((route, index) => (
        <Route key={`route-${index}`} path={route.path} exact render={() => <route.component />} />
      ))}
    </Switch>
  </Router>
);



