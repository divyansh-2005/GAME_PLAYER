import React from 'react';
import {Link} from 'react-router-dom'
import {useTma} from '../Context/tmaProvider'
import { ConnectButton } from '@rainbow-me/rainbowkit';

const HeroSection = () => {
  const { user } = useTma();

  return (
  <>
  <section className="comp-section" id="home">
    <div className="compcontainer">
      <p className="paragraph">
        Welcome
      </p>
      <h1 className='herosectionH1'>  {user?.firstName}    </h1>
      <h2>
        
      </h2>
      {/* <h3>Instant Games, spot in a single place!!</h3> */}
      <p className="paragraph">
        TeleGames is a collection of instant Games
      </p>
      <Link to={'/games'} >
        <button className="started">Explore Games &gt;&gt;</button>
      </Link>
    </div>
  </section>
  </>
);
}

export default HeroSection;