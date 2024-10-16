import React from "react";

/**
 * 6×6×12 space grid component
 */
const ThreeSidedGrid = () => {
  const size = 6;
  const divisions = 6;
  const color = "gray";

  return (
    <group position={[0, 0, 0]}>
      {/* Bottom face */}
      <gridHelper
        args={[size, divisions, color]}
        position={[size / 2, 0, size / 2]}
      />
      {/* Left side */}
      <gridHelper
        args={[size, divisions, color]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        position={[0, (3 * size) / 2, size / 2]}
      />
      <gridHelper
        args={[size, divisions, color]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        position={[0, size / 2, size / 2]}
      />
      {/* Back side */}
      <gridHelper
        args={[size, divisions, color]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[size / 2, (3 * size) / 2, 0]}
      />
      <gridHelper
        args={[size, divisions, color]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[size / 2, size / 2, 0]}
      />
    </group>
  );
};

export default ThreeSidedGrid;
