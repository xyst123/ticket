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

const defaultRoute = {
    path: '/main',
    component: Main,
    title:'Ticket',
    auth:true,
  }
const routes = [
  defaultRoute, {
    path: '/login',
    component: Login,
    title:'登录',
    auth:true,
  }, {
    path: '/ticket',
    component: Ticket,
    title:'选择车次',
    auth:true,
  }
]

export const Routes = () => (
  <Router routes={routes}>
    <Switch>
      <Route path='/' exact render={()=> (<Redirect to={defaultRoute.path}/>)}/>
      {routes.map((route, index) =>{
        const currentRoute=route.auth?route:defaultRoute;
        return (
        <Route key={`route-${index}`} path={currentRoute.path} exact render={() =>{
          const title=currentRoute.title;
          document.title=title;
          return <currentRoute.component title={title} />
        }} />
      )})}
    </Switch>
  </Router>
);



