import './index.css';
import App from './App';
import Header from '../../../Components/Header'
import Footer from '../../../Components/Footer'

export default function SlotMachineGame() {
  return (
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}>
    <Header />
    <div style={{backgroundColor:"white",fontFamily:" Pacifico, cursive",paddingTop:"50px" , height:"75vh",width:"100vw"}}>
        <App />
    </div>
    <Footer/>
    </div>
  )
}
