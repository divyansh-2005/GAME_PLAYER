/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import { useTma } from "../Context/tmaProvider";
import "./HeroSectionStyles.css"

const HeroSection = () => {
  const { user } = useTma();

  return (
    <>
      <section className="comp-section" id="home">
        <div className="compcontainer">
          <div className="text-container">
            <span>All</span>
            <span>Your</span>
            <span>Instant</span>
            <span>Games</span>
            <span>In</span>
            <span>One</span>
            <span>Place !</span>
          </div>
          <div className="keyboard">
            <span className="key">L</span>
            <span className="key">E</span>
            <span className="key">T</span>
            <span className="key">'</span>
            <span className="key">S</span>
            <span className="key">P</span>
            <span className="key">L</span>
            <span className="key">A</span>
            <span className="key">Y</span>
          </div>
          <h1 className="h1">{user?.firstName}</h1>

          <Link to={"/games"}>
            <button className="started">Explore Games &gt;&gt;</button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
