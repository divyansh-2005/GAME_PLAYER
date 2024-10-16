import { Box } from '@react-three/drei';
import React from 'react';
import { BoxGeometry } from 'three';

/**
 * Represents a single block in 3D space.
 */
export const Tetriminos = {
  OrangeRicky: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 },
    ],
    color: '#ff9562',
  },
  BlueRicky: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: -1, y: 1, z: 0 },
    ],
    color: '#5eaeff',
  },
  ClevelandZ: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: -1, y: -1, z: 0 },
    ],
    color: '#de5f75',
  },
  RhodeIslandZ: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 },
    ],
    color: '#79dd53',
  },
  Hero: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
    ],
    color: '#3fdcd5',
  },
  Teewee: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
    ],
    color: '#af60ff',
  },
  Smashboy: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 },
    ],
    color: '#ffff4d',
  },
};

/**
 * A single cube component.
 */
export const Cube = ({ position, color }) => {
  return (
    <group position={[position.x, position.y, position.z]}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color={color} />
      </Box>
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial attach="material" color="black" />
      </lineSegments>
    </group>
  );
};

/**
 * The whole tetrimino composed of multiple blocks.
 */
export const TetriminoSet = ({ type, position, blocks, scale = 1 }) => {
  const tetriminoColor = Tetriminos[type].color;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {blocks.map((block, index) => (
        <Cube key={index} position={block} color={tetriminoColor} />
      ))}
      <mesh receiveShadow position={[0, -0.1, 0]} visible={false} />
    </group>
  );
};

/**
 * Displays fallen cubes.
 */
export const FallenCubes = ({ gridState }) => {
  const cubes = [];

  for (let x = 0; x < gridState.length; x++) {
    for (let z = 0; z < gridState[x].length; z++) {
      for (let y = 0; y < gridState[x][z].length; y++) {
        const color = gridState[x][z][y];
        if (color) {
          cubes.push(
            <Cube
              key={`${x},${y},${z}`}
              position={{ x: x + 0.5, y: y + 0.5, z: z + 0.5 }}
              color={color}
            />
          );
        }
      }
    }
  }

  return <>{cubes}</>;
};
