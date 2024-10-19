import React, { forwardRef } from "react";

const Canvas = forwardRef((props, ref) => {
  return <canvas ref={ref} width={480} height={320} {...props} />;
});

export default Canvas;
