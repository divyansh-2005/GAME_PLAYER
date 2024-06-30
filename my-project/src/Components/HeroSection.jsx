import React, { useRef } from 'react';
import { useTma } from './tma/hook';

const HeroSection = ({ scrollToGameSection }) => {
  const { user } = useTma();
  return (
  <section className="comp-section" id="home">
    <div className="compcontainer">
      <h1 className='herosectionH1'>
        {user?.firstName}
      </h1>
      <h3>Instant Games, spot in a single place!!</h3>
      <p className="paragraph">
        TeleGames is a collection of instant Games
      </p>
      <div>
        <button className="started" onClick={scrollToGameSection}>Explore Games &gt;&gt;</button>
      </div>
    </div>
  </section>
  );
}

export default HeroSection;
