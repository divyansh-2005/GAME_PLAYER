import React from 'react';
import ReactDOM from 'react-dom';
import PongGame from './PongGame';

const App = () => {
  return (
    <div>
      <h1>Pong Game</h1>
      <PongGame />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
