import { React, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";

export default function BoxModel({ box, removeBox }) {
    const state = useRef({
        position: getPosition(),
    });

    const [myBox, api] = useBox(() => ({
        mass: 1,
        position: getPosition(),
        args: [box.width, 1, box.depth],
        type: "Dynamic",
    }));

    useEffect(() => {
        api.position.subscribe((p) => (state.current.position = p));
    }, [api]);

    useFrame(() => {
        if (state.current.position.x < -10) {
            removeBox(box.id);
        }
    });

    function getPosition() {
        return [box.x, box.y, box.z];
    }

    return (
        <mesh ref={myBox} position={getPosition()}>
            <boxGeometry args={[box.width, 1, box.depth]} />
            <meshStandardMaterial color={`hsl(${200 + box.y * 4},100%,50%)`} />
        </mesh>
    );
}
