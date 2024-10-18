import './index.css';
import App from './App';
import Header from "../../../Components/Header"

function StackTowerGame() {
  return (
    <>
      <div style={{margin: 0,
      padding: 0,
      width: "100%",
      height: "100vh"}}>
      <Header />
       <App />
      </div>
    </>
  )
}

export default StackTowerGame