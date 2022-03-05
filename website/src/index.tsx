import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { store, StoreContext } from './store/root-store';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreContext.Provider value={store}>
        <ChakraProvider>
          <CSSReset />
          <App />
        </ChakraProvider>
      </StoreContext.Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
