import React, { useState } from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom';
import Home from './views/home/home';
import ItemDetail from './views/itemDetail/itemDetail';

export const menuContext = React.createContext(null);

function App() {
  const [menuItems] = useState([
    {
      id: 1,
      name: 'Spaghetti',
      imgUrl: '',
      ingredients: ['Spaghetti Noodle', 'Spaghetti Sauce'],
    },
    {
      id: 2, 
      name: 'Hu Tieu',
      imgUrl: '',
      ingredients: ['Hu Tieu', 'Thit', 'Xuong'],
    }, 
    {
      id: 3, 
      name: 'Hu Tieu',
      imgUrl: '',
      ingredients: ['Hu Tieu', 'Thit', 'Xuong'],
    },
 ]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>This week's menu</h1>
      </header>
      <div>
        <menuContext.Provider value={menuItems}>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/:itemId" component={ItemDetail}/>
          </Switch>
        </menuContext.Provider>
        
      </div>
    </div>
  );
}

export default App;
