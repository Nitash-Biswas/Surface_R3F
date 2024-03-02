import React, { useEffect, useRef, useState } from "react";
import { useControls } from "leva";
import * as THREE from "three";
import SpawnParticle from "./SpawnParticle";
import { useTexture } from "@react-three/drei";

/**
 * SpawnSurface():
 1. Allows you to return the selected "Surfaces" mesh which can
    be applied for both predefined meshes (plane, cube, sphere)
    or external gltf objects (gltf).
 
 2. Passes the selected mesh into SpawnParticle(),
    to start calculating and storing random points on
    the surface of the selected mesh.
 */

function SpawnSurface() {
  
  const groupRef = useRef();
  const surfaceRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  
  const { model, size, pos, rotation } = useControls("Surfaces", {
    model: { options: ["plane", "cube", "sphere", "cone"] },
    size: { value: 5, step: 0.01, min: 0.1, max: 10 },
    pos: { value: { x: 0, z: 0 }, step: 0.01 },
    rotation: { value: { x: 90, y: 0, z: 0 }, step: 1 }, // Use step in degrees
  });

  //Texture Maps for the Spawn Surface
  const props = useTexture({
    map: "./assets/maps/coast_sand_rocks_02_diff_1k.jpg",
    normalMap: "./assets/maps/coast_sand_rocks_02_nor_dx_1k.jpg",
    roughnessMap: "./assets/maps/coast_sand_rocks_02_rough_1k.jpg",
    aoMap: "./assets/maps/coast_sand_rocks_02_ao_1k.jpg",
  });

  const textureMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    map: props.map,
    normalMap: props.normalMap,
    aoMap: props.aoMap,
    roughnessMap: props.roughnessMap,
  });
  textureMaterial.map.colorSpace = THREE.SRGBColorSpace;
  
  useEffect(() => {
    setModelLoaded(false);
    cleanupAndLoadSurface();
  }, [model, size, textureMaterial, pos, rotation]);

  /**
   * cleanupAndLoadSurface:
      Cleans up the existing group, loads the selected model (gltf or predefined),
      and sets up its properties. Uses loadGltfModel() for loading gltf models.
   */
  const cleanupAndLoadSurface = async () => {
    cleanUpGroup(groupRef.current);

  
      const surface = createSurface(
        model,
        size,
        textureMaterial,
        pos,
        rotation
      );
      groupRef.current.add(surface);
      surfaceRef.current = surface;
    
  };

  useEffect(() => {
    if (surfaceRef && surfaceRef.current) {
      setModelLoaded(true);
    }
  }, [surfaceRef.current]);

  return (
    <>
      <group ref={groupRef} />
      {modelLoaded && <SpawnParticle targetMesh={surfaceRef.current} />}
    </>
  );
}

/**
 * cleanUpGroup():
    Disposes of the geometry and material of the objects in the group,
    clearing the children of the group.
 */

function cleanUpGroup(group) {
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      object.material.dispose();
    }
  });
  group.children.length = 0;
}


/**
 * createSurface():
    Creates and returns a mesh based on the provided model type.
 */
function createSurface(model, size, textureMaterial, pos, rotation) {
  let surface;

  switch (model) {
    case "sphere":
      surface = new THREE.Mesh(
        new THREE.SphereGeometry(size/2, 32, 32),
        textureMaterial
      );
      break;
    case "cube":
      surface = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        textureMaterial
      );
      break;
    case "plane":
      surface = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        textureMaterial
      );
      break;
    case "cone":
      surface = new THREE.Mesh(
        new THREE.ConeGeometry(size/2, size),
        textureMaterial
      );
      break;
    default:
      break;
  }

  //Surface Transformations
  surface.position.set(pos.x, 0, pos.z);
  surface.rotation.set(
    THREE.MathUtils.degToRad(rotation.x),
    THREE.MathUtils.degToRad(rotation.y),
    THREE.MathUtils.degToRad(rotation.z)
  );
  surface.castShadow = true;
  surface.name = model;

  return surface;
}

export default SpawnSurface;
