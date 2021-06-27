import { useState } from 'react';
import './App.css';
import  MenuList  from './components/menu-list/menu-list.component'

function App() {
 const [menuItems, setMenuItems] = useState([
    {
      itemImg: '',
      itemName: 'Spaghetti',
      itemIngredients: ['Spaghetti Noodle', 'Spaghetti Sauce'],
    },
    {
      itemImg: '',
      itemName: 'Hu Tieu',
      itemIngredients: ['Hu Tieu', 'Thit', 'Xuong'],
    }
 ])

  return (
    <div className="App">
      <header className="App-header">
        <h1>This week's menu</h1>
      </header>
      <div>
        Main -----
        <MenuList menuItems={menuItems}/>
        Soup -----
      </div>
    </div>
  );
}

export default App;
