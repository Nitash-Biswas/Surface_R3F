import React, { useRef, Suspense } from "react";
import { useThree, extend } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import { Environment } from "@react-three/drei";
import SpawnSurface from "./SpawnSurface";

extend({ OrbitControls });

function App() {
  const { camera, gl } = useThree();

  const { perfVisible } = useControls("Performance", {
    perfVisible: true,
  });

  const { sunPosition, sunIntensity } = useControls("Sun", {
    sunPosition: { value: [0.8, 0.2, -0.4]},
    sunIntensity: {value: 5.0, step: 0.5 ,min:1,max:10}
  });
  

  return (
    <>
      <orbitControls args={[camera, gl.domElement]} />
      <directionalLight position={sunPosition} intensity={sunIntensity} castShadow />
      <ambientLight intensity={1} />

      {perfVisible && <Perf position="top-left" />}
      <Environment background files="./assets/steinbach_field_2k.exr" />

      <Suspense fallback={null}>f
        <SpawnSurface />
      </Suspense>
    </>
  );
}

export default App;
