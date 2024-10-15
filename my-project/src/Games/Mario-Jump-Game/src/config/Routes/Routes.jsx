import React from "react";
import "../../App.css";
import { useSelector } from "react-redux";
import { Birds, Bricks, Clouds, Mario, Obstacles, Sun, KeyMessage, Score, MobileControls, Title} from "../../components";
import Header from "../../../../../Components/Header";

function Home() {
    const isPlay = useSelector((state) => state.engine.play);
    return (
        <>
            <Header/>
            <div className="App">
                {!isPlay && <KeyMessage />}
                <Bricks />
                <Mario />
                <Sun />
                <Clouds />
                <Birds />
                <Obstacles />
                <Score />
            </div>
            <MobileControls />
        </>
    );
}

export default Home;
