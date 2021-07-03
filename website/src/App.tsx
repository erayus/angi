import React from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom';
import Home from './views/home/home';


function App() {
  return (
    <div className="App">
      <div>
         <Switch>
            <Route path="/" component={Home}/>
            {/* <Route path="/menu-items/:itemId" component={ItemDetail}/> */}
          </Switch>
      </div>
    </div>
  );
}

export default App;
