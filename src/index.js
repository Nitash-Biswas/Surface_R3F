import React from 'react';
import { StrictMode } from 'react'
import { Canvas } from '@react-three/fiber';
import ReactDOM from 'react-dom/client';
import './style.css';
import App from './App';
import * as THREE from 'three'
import { Leva} from 'leva'


const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <StrictMode>
    <Leva/>
    <Canvas
      shadows
      gl ={{
        antialias:true,
        toneMapping: THREE.ACESFilmicToneMapping 
      }}
      camera={{
        near:0.1,
        far:200,
        position: [0,5,5]
      }}
    >
      
      <App/>
    </Canvas>
  </StrictMode>
  
);