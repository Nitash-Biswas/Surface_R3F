import React, { useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";

/**
  * InstanceGLTF():
  1.  Takes positions (2D array received from SpawnParticle()), 
      count, size, model, and isVisible as props to create an InstancedMesh.

  2.  Handles the disposal of the previous mesh when the component is re-rendered and waits for the model to load.
*/ 

function InstanceGLTF({ positions, count, size, model, isVisible }) {
  const meshRef = useRef();

  // Dispose of previous mesh when component is re-rendered
  if (meshRef.current) {
    meshRef.current.geometry.dispose();
    meshRef.current.material.dispose();
  }

  const { pos, rotation } = useControls("Surfaces", {
    pos: { value: { x: 0, z: 0 }, step: 0.01 },
    rotation: { value: { x: 90, y: 0, z: 50 }, step: 1 },
  });

  // Wait until the model is loaded
  if (!model) {
    return null;
  }

  const geometry = model.scene.children[0].geometry;
  const material = model.scene.children[0].material;

  // Create a single InstancedMesh
  const newMesh = new THREE.InstancedMesh(geometry, material, count);
  const shape = new THREE.Object3D();

  // Transformation of Entire Instanced Mesh
  newMesh.position.set(pos.x, 0, pos.z);
  newMesh.rotation.set(
    THREE.MathUtils.degToRad(rotation.x),
    THREE.MathUtils.degToRad(rotation.y),
    THREE.MathUtils.degToRad(rotation.z)
  );

  // Transformation of Each Element Mesh
  shape.scale.set(size, size, size);

  for (let i = 0; i < count; i++) {
    if (positions[i]) {
      shape.position.x = positions[i][0];
      shape.position.y = positions[i][1];
      shape.position.z = positions[i][2];
      const randomRotateY = Math.random() * 2 * Math.PI;
      shape.rotation.set(-Math.PI / 2, randomRotateY, 0);

      // Use the setMatrixAt method to set the transformation matrix for each instance
      shape.updateMatrix();
      newMesh.setMatrixAt(i, shape.matrix);
    }
  }

  // Set visibility based on the control
  newMesh.visible = isVisible;

  // Stores the new mesh reference once the previous is deleted
  meshRef.current = newMesh;

  // Returns a primitive object containing the InstancedMesh
  return (
    <>
      <primitive object={meshRef.current} />
    </>
  );
}

export default InstanceGLTF;

