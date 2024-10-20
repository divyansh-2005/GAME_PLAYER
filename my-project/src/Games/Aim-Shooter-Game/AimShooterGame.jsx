import { useState } from "react";
import Home from "./src/components/Home/Home"; 
import RegAim from "./src/pages/RegAim"; 
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Back from "../../Components/Back";

function AimShooterGame() {
  const [screen, setScreen] = useState(0);
  
  const regAim = () => setScreen(1);
  // const preAim = () => setScreen(2);

  return (
    <div>
      <Header />
      <Back/>
      {screen === 0 && <Home regAim={regAim} />}
      {screen === 1 && <RegAim />}
      <Footer />
    </div>
  );
}

export default AimShooterGame;
