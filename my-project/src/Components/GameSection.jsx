import React, { useState } from 'react';
import githubIcon from '../assets/images/github.png'; // Import your GitHub icon

const GameSection = () => {
  const [games, setGames] = useState([
    {
      name: 'Guess the Hex',
      description: 'Description of Game A',
      link: '../Games/GuessTheColor/GTH',
    },
    {
      name: 'Flip Card Game',
      description: 'Description of Game B',
      link: '../Games/FlipCard/FlipCard',
    },
    {
      name: 'Snake Game',
      description: 'Description of Game C',
      link: '#',
    },
    {
      name: 'Emoji Intruder',
      description: 'Description of Game D',
      link: '#',
    },
    {
      name: 'RockPaper Scissors',
      description: 'Description of Game E',
      link: '#',
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="container" id="games">
      <div id="searchBar">
        <h1>Search Games</h1><br />
        <div className="search-input-container">
          <input
            type="text"
            id="gameSearch"
            placeholder="Enter Game Name"
            onChange={handleSearch}
          />
        </div>
      </div>

      {filteredGames.length > 0 ? (
        filteredGames.map((game, index) => (
          <div className="box" key={index}>
            <div className="content">
              <h2>{game.name}</h2>
              <h3>{game.description}</h3>
              <div className="card-footer">
                <a href={game.link} target="_blank" rel="noopener noreferrer">
                  <button>Play</button>
                </a>
                {/* <a href={game.source} title="Source Code" target="_blank" rel="noopener noreferrer">
                  <img src={githubIcon} alt="Source Code" />
                </a> */}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div id="noResults">No results found</div>
      )}
    </div>
  );
};

export default GameSection;
