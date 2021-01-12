import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import Board from "./components/Board";
import Join from "./components/Join";

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className='logo-wrapper'>
        <h1>Tic Tac Toe</h1>
      </div>
      <Route path="/" exact component={Join} />
      <Route path="/game" component={Board} />
    </BrowserRouter>
  );
}

export default App;
