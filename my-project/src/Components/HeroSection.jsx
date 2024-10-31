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
      <div className='flex flex-col items-center text-center mt-2'>
      <p className="paragraph text-5xl">
        WELCOME
      </p>
      <hr className='w-40 -mt-2 mb-1 border-t-2 border-primary' />
      </div>
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