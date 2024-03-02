import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import * as THREE from "three";
import { useControls } from "leva";
import InstanceGLTF from "./InstanceGLTF";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

/**
 * SpawnParticle():
  1.Takes the mesh provided from SpawnSurface() and creates a
    2D array "pos" containing the coordinates of the random points
    on the surface of the provided mesh.
  
  2.This 2D array is then used by InstancedGLTF() to know the coordinates
    while placing each Instanced Mesh of the selected GLTF model.
 */

export default function SpawnParticle({ targetMesh }) {
  const particles = useControls("Model", {
    pCount: {
      value: 200,
      min: 1,
      max: 100000,
      step: 1,
    },
    size: { value: 0.01, step: 0.01, min: 0.1, max: 1.0 },
    modelChoice: { options: ["rock", "grass", "flower", "cone"] },
    visibility: true,
  });

  const [pointsData, setPointsData] = useState({ positions: [] });
  const pointsRef = useRef();

  /**
   * generateRandomPositions():
   1.Generates random positions on the surface of the provided mesh.

   2. Uses barycentric coordinates to distribute points on the faces of the mesh.
   */
  const generateRandomPositions = useCallback(() => {
    if (!targetMesh) return new Float32Array();

    //Extract vertices and faces of targetMesh
    const targetVertices = targetMesh.geometry.attributes.position.array;
    const targetFaces = targetMesh.geometry.index.array;
    const faceCount = targetFaces.length / 3;

    const newPositions = new Float32Array(particles.pCount * 3);
    const pos = [];

    for (let i = 0; i < particles.pCount * 3; i += 3) {
      const randomFaceIndex = Math.floor(Math.random() * faceCount);
      const faceIndex = randomFaceIndex * 3;

      const [v1, v2, v3] = [0, 1, 2].map((j) => targetFaces[faceIndex + j] * 3);
      const tempPos = [];
      const barycentric = [...Array(3)].map(() => Math.random());
      const sum = barycentric.reduce((acc, val) => acc + val, 0);
      const normalizedBarycentric = barycentric.map((val) => val / sum);
      for (let j = 0; j < 3; j++) {
        newPositions[i + j] =
          normalizedBarycentric[0] * targetVertices[v1 + j] +
          normalizedBarycentric[1] * targetVertices[v2 + j] +
          normalizedBarycentric[2] * targetVertices[v3 + j];
        tempPos.push(newPositions[i + j]);
      }
      pos.push(tempPos);
    }
    setPointsData({ positions: pos });
    return newPositions;
  }, [targetMesh, particles.pCount]);
  

  useEffect(() => {
    if (pointsRef.current) {
      const positions = generateRandomPositions();
      pointsRef.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
    }
  }, [particles.pCount, targetMesh, generateRandomPositions]);

  /**
   * Memoized version of generateRandomPositions.
   */
  useMemo(
    () => generateRandomPositions(),
    [generateRandomPositions]
  );

  const [loadedModel, setLoadedModel] = useState(null);

  useEffect(() => {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(`./assets/${particles.modelChoice}.gltf`, 
    (gltf) => {
      setLoadedModel(gltf);
    });
  }, [particles.modelChoice]);

  return (
    <>
      <InstanceGLTF
        positions={pointsData.positions}
        count={pointsData.positions.length}
        size={particles.size}
        model={loadedModel}
        isVisible={particles.visibility}
      />
    </>
  );
}
