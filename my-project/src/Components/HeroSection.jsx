import React from 'react';
import {Link} from 'react-router-dom'
import { TmaProvider } from './tma/provider';
import { Me } from './tma/me';

const HeroSection = () => (
  <section className="comp-section" id="home">
    <div className="compcontainer">
      <h1 className='herosectionH1'>
      <TmaProvider>
          <Me />
        </TmaProvider>
      </h1>
      <h2>
        
      </h2>
      <h3>Instant Games, spot in a single place!!</h3>
      <p className="paragraph">
        TeleGames is a collection of instant Games
      </p>
      <Link to={'/'} href="#games">
        <button className="started">Explore Games &gt;&gt;</button>
      </Link>
    </div>
  </section>
);

export default HeroSection;
