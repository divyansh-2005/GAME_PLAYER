import React, { useRef } from 'react';
import { TmaProvider } from './tma/provider';
import { Me } from './tma/me';

const HeroSection = ({ scrollToGameSection }) => (
  <section className="comp-section" id="home">
    <div className="compcontainer">
      <h1 className='herosectionH1'>
        <TmaProvider>
          <Me />
        </TmaProvider>
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

export default HeroSection;
