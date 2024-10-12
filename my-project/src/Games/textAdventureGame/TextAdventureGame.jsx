// text-adventure-game\src\AdventureGame.js

import React, { useState } from 'react';

function AdventureGame() {
  const [currentScene, setCurrentScene] = useState('start');
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [health, setHealth] = useState(100);

  const handleInput = (choice) => {
    switch (currentScene) {
      case 'start':
        if (choice === '1') {
          setCurrentScene('scene1');
        } else if (choice === '2') {
          setCurrentScene('scene2');
        } else {
          alert('Invalid choice!');
        }
        break;
      case 'scene1':
        if (choice === '1') {
          setCurrentScene('scene3');
          setScore(score + 1);
        } else {
          setCurrentScene('end');
          setHealth(health - 20);
        }
        break;
      case 'scene2':
        if (choice === '1') {
          setCurrentScene('scene4');
          setInventory([...inventory, 'map']);
        } else {
          setCurrentScene('scene5');
        }
        break;
      case 'scene3':
        if (choice === '1') {
          setCurrentScene('end');
          setHealth(health - 30);
        } else {
          setCurrentScene('end');
          setHealth(health - 10);
        }
        break;
      case 'scene4':
        if (choice === '1') {
          setCurrentScene('scene6');
          setScore(score + 2);
        } else {
          setCurrentScene('scene7');
        }
        break;
      default:
        setCurrentScene('start');
    }
  };

  const renderScene = () => {
    switch (currentScene) {
      case 'start':
        return (
          <div>
            <p>Welcome to the Adventure Game!</p>
            <p>What's your name?</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <p>Choose your path:</p>
            <button onClick={() => handleInput('1')}>Path 1</button>
            <button onClick={() => handleInput('2')}>Path 2</button>
          </div>
        );
      case 'scene1':
        return (
          <div>
            <p>
                Scene 1: You wake up in a dense forest. 
                What do you do?
            </p>
            <button onClick={() => handleInput('1')}>
                Explore deeper into the forest
            </button>
            <button onClick={() => handleInput('2')}>
                Look for a way out
            </button>
          </div>
        );
      case 'scene2':
        return (
          <div>
            <p>Scene 2: You find an abandoned cabin. What do you do?</p>
            <button onClick={() => handleInput('1')}>
                Search the cabin for supplies
            </button>
            <button onClick={() => handleInput('2')}>
                Ignore the cabin and keep moving
            </button>
          </div>
        );
      case 'scene3':
        return (
          <div>
            <p>Scene 3: You encounter a group of hostile creatures.</p>
            <button onClick={() => handleInput('1')}>
                Fight them off
            </button>
            <button onClick={() => handleInput('2')}>
                Try to flee
            </button>
          </div>
        );
      case 'scene4':
        return (
          <div>
            <p>Scene 4: You discover a hidden map inside the cabin.</p>
            <button onClick={() => handleInput('1')}>
                Take the map and continue your journey
            </button>
            <button onClick={() => handleInput('2')}>
                Leave the map and move on
            </button>
          </div>
        );
      case 'scene5':
        return (
          <div>
            <p>
                Scene 5: A sudden storm forces you 
                to seek shelter in the cabin.
            </p>
            <button onClick={() => handleInput('1')}>
                Wait out the storm inside the cabin
            </button>
            <button onClick={() => handleInput('2')}>
                Risk continuing your journey despite the storm
            </button>
          </div>
        );
      case 'scene6':
        return (
          <div>
            <p>
                Scene 6: You stumble upon a hidden cave 
                filled with treasures!
            </p>
            <button onClick={() => handleInput('1')}>
                Explore the cave further
            </button>
            <button onClick={() => handleInput('2')}>
                Leave the cave with the treasures you've found
            </button>
          </div>
        );
      case 'scene7':
        return (
          <div>
            <p>
                Scene 7: You encounter a friendly 
                traveler who offers to join you on your adventure.
            </p>
            <button onClick={() => handleInput('1')}>
                Accept the traveler's offer
            </button>
            <button onClick={() => handleInput('2')}>
                Continue your journey alone
            </button>
          </div>
        );
      case 'end':
        return (
          <div>
            <p>Game over, {playerName}!</p>
            <p>Your health: {health}</p>
            <p>Your score: {score}</p>
            <p>Inventory: {inventory.join(', ')}</p>
            <button onClick={() => setCurrentScene('start')}>
                Play again
            </button>
          </div>
        );
      default:
        return <p>Invalid scene!</p>;
    }
  };

  return <div>{renderScene()}</div>;
}

export default AdventureGame;
