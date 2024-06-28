import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { TmaProvider } from './Components/tma/provider';
import { Me } from './Components/tma/me';
import HomePage from "./Components/HomePage";

const App = () => {
  return (
    <>
      {/* <TmaProvider>
        <Me />
      </TmaProvider> */}
    <HomePage />
  </>
  );
};

export default App;
