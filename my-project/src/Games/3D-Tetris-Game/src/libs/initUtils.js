import { Tetriminos } from "../components/Tetrimino";

let bag = [];

/**
 * Randomly selects a Tetrimino type (Multi-bag Random Generator)
 */
export function getRandomTetrimino() {
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const fillBag = () => {
    const tetriminos = Object.keys(Tetriminos);
    for (let i = 0; i < 3; i++) {
      // Three of each Tetrimino
      bag.push(...tetriminos);
    }
    shuffleArray(bag);
  };

  if (bag.length === 0) {
    fillBag();
  }

  return bag.pop();
}

/**
 * Randomly rotates blocks
 */
export function rotateRandomly(blocks) {
  for (let i = 0; i < 5; i++) {
    const rotateTypes = Math.floor(Math.random() * 3);
    switch (rotateTypes) {
      case 0:
        blocks = blocks.map((block) => ({ x: block.y, y: -block.x, z: block.z }));
        break;
      case 1:
        blocks = blocks.map((block) => ({ x: -block.z, y: block.y, z: block.x }));
        break;
      default:
        break;
    }
  }
  return blocks;
}

/**
 * Gets a random falling position
 */
export function getRandomPosition(rotatedBlocks) {
  const getBounds = (blocks) => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    blocks.forEach((block) => {
      minX = Math.min(minX, block.x);
      maxX = Math.max(maxX, block.x);
      minY = Math.min(minY, block.y);
      maxY = Math.max(maxY, block.y);
      minZ = Math.min(minZ, block.z);
      maxZ = Math.max(maxZ, block.z);
    });

    return { minX, maxX, minY, maxY, minZ, maxZ };
  };

  const bounds = getBounds(rotatedBlocks);

  const xRange = 5 - (bounds.maxX - bounds.minX);
  const zRange = 5 - (bounds.maxZ - bounds.minZ);

  const x = Math.floor(Math.random() * xRange) - bounds.minX + 0.5;
  const y = 11.5 - bounds.maxY;
  const z = Math.floor(Math.random() * zRange) - bounds.minZ + 0.5;

  return [x, y, z];
}
