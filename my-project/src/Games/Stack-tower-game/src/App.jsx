import { React, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import BoxModel from "./Components/BoxModel";
import SolidBox from "./Components/SolidBox";
import FallingBox from "./Components/FallingBox";
import Screen from "./Components/Screen";
import { Physics } from "@react-three/cannon";
import { nanoid } from "nanoid";

function App() {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [fallingStack, setFallingStack] = useState([]);
    const [stack, setStack] = useState([
        { x: 0, z: 0, height: 0, width: 3, depth: 3 },
    ]);
    const [gameStarted, setGameStarted] = useState(false);
    const [BGColor, setBGColor] = useState("#000");
    const [topBoxPosition, setTopBoxPosition] = useState({
        x: 0,
        y: 0,
        z: 0,
    });
    const width = window.innerWidth;
    const height = window.innerHeight;

    const handleClick = () => {
        if (gameStarted) {
            cutFallenBox();
        }
    };

    useEffect(() => {
        let bg = "#000";
        if (stack.length > 3) {
            bg = "#10122b";
        }
        if (stack.length > 10) {
            bg = "#24003b";
        }
        if (stack.length > 20) {
            bg = "#2b0125";
        }
        if (stack.length > 30) {
            bg = "#360113";
        }
        if (stack.length > 40) {
            bg = "#400000";
        }
        if (BGColor !== bg) {
            setBGColor(bg);
        }
        //eslint-disable-next-line
    }, [stack]);

    const cutFallenBox = () => {
        let prevBox = stack[stack.length - 2];
        let topBox = topBoxPosition;
        let fallingBox = {
            id: nanoid(),
            x: 0,
            y: topBox.y,
            z: 0,
            width: 0,
            depth: 0,
        };

        let direction = "";
        let checkSize = "";
        if (stack.length % 2 === 0) {
            direction = "z";
            checkSize = "depth";
            fallingBox.x = topBox.x;
            fallingBox.width = prevBox.width;
        } else {
            direction = "x";
            checkSize = "width";
            fallingBox.z = topBox.z;
            fallingBox.depth = prevBox.depth;
        }
        const delta = Math.abs(prevBox[direction] - topBox[direction]).toFixed(
            2
        );
        const overlap = prevBox[checkSize] - delta;

        if (overlap <= 0) {
            let stackUpdate = stack;
            stackUpdate.pop();
            setStack([...stackUpdate]);
            setGameStarted(false);
            fallingBox[direction] = topBox[direction];
            fallingBox[checkSize] = prevBox[checkSize];
        } else {
            fallingBox[checkSize] = delta;
            fallingBox[direction] = topBox[direction];
            if (prevBox[direction] - topBox[direction] > 0) {
                fallingBox[direction] -= overlap / 2;
                topBox[direction] += delta / 2;
            } else {
                fallingBox[direction] += overlap / 2;
                topBox[direction] -= delta / 2;
            }

            let stackUpdate = stack;
            stackUpdate.pop();
            stackUpdate.push({
                x: topBox.x,
                z: topBox.z,
                height: topBox.y,
                width: prevBox.width,
                depth: prevBox.depth,
                [checkSize]: overlap,
            });

            setStack([...stackUpdate]);
            generateBox();
        }
        setFallingStack((prev) => {
            return [...prev, fallingBox];
        });
    };

    const generateBox = () => {
        setStack((prev) => {
            return [
                ...prev,
                {
                    ...prev[prev.length - 1],
                    height: prev[prev.length - 1].height + 1,
                },
            ];
        });
    };

    const renderBoxes = () => {
        return stack.map((box, index) => {
            let animate = false;
            let direction = "";
            if (index > 0 && index === stack.length - 1 && gameStarted) {
                animate = true;
                if (index % 2 === 0) {
                    direction = "right";
                } else {
                    direction = "left";
                }
            }
            let key = nanoid();
            if (index === stack.length - 1) {
                key = index;
            }
            if (index === stack.length - 1 && gameStarted) {
                return (
                    <BoxModel
                        key={key}
                        xpos={box.x}
                        zpos={box.z}
                        width={box.width}
                        depth={box.depth}
                        animate={animate}
                        height={box.height}
                        direction={direction}
                        gameStarted={gameStarted}
                        crossedLimit={() => crossedLimit()}
                        updatePosition={setTopBoxPosition}
                    />
                );
            } else {
                return (
                    <SolidBox
                        key={key}
                        xpos={box.x}
                        zpos={box.z}
                        width={box.width}
                        depth={box.depth}
                        height={box.height}
                    />
                );
            }
        });
    };

    const startNewGame = async () => {
        if (!gameStarted) {
            setFallingStack([]);
            setStack([{ height: 0, width: 3, depth: 3, x: 0, z: 0 }]);
            setTopBoxPosition({
                x: 0,
                y: 0,
                z: 0,
            });
            setGameStarted(true);
            await new Promise((resolve) => setTimeout(resolve, 250));
            generateBox();
        }
    };

    const renderFallingBoxes = () => {
        return fallingStack.map((box) => {
            return <FallingBox key={box.id} box={box} removeBox={removeBox} />;
        });
    };

    const removeBox = (id) => {
        let stackUpdate = fallingStack;
        stackUpdate = stackUpdate.filter((box) => box.id !== id);
        setFallingStack(stackUpdate);
    };

    const crossedLimit = () => {
        let stackUpdate = stack;
        stackUpdate.pop();
        setStack([...stackUpdate]);
        setGameStarted(false);
    };

    const getCameraPosition = () => {
        if (windowSize.width < 700) {
            if (stack.length < 3) {
                return [0, 3, 4];
            }
            return [0, stack.length / 2 + 2, 4];
        }
        if (stack.length < 3) {
            return [0, 4, 4];
        }
        return [0, stack.length + 2, 4];
    };

    const getGameScale = () => {
        if (windowSize.width < 700) {
            return 0.5;
        }
        return 1;
    };

    return (
        <>
            <div className="app-wrapper" style={{ backgroundColor: BGColor }}>
                {!gameStarted && (
                    <Screen score={stack.length - 1} startGame={startNewGame} />
                )}
                <Canvas onClick={() => handleClick()}>
                    <OrthographicCamera
                        makeDefault
                        left={-width / 2}
                        right={width / 2}
                        top={height / 2}
                        bottom={-height / 2}
                        near={-5}
                        far={200}
                        zoom={100}
                        position={getCameraPosition()}
                        rotation={[-0.5, 0, 0]}
                        lookAt={[0, 0, 0]}
                    />
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 20, 0]} intensity={0.6} />
                    <Physics>
                        <group
                            scale={getGameScale()}
                            rotation={[0, Math.PI / 4, 0]}
                        >
                            {renderBoxes()}
                            {renderFallingBoxes()}
                        </group>
                    </Physics>
                </Canvas>
            </div>
        </>
    );
}

export default App;
