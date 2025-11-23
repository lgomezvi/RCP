'use client';

import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Center } from '@react-three/drei';

import { ArmRotations } from './types';
import { armConfig } from './arm-config'; // Import armConfig

interface ArmModelProps {
  rotations: ArmRotations;
  highlightedMeshes?: string[];
}

const ArmModel = ({ rotations, highlightedMeshes = [] }: ArmModelProps) => {
  const gltf = useLoader(GLTFLoader, '/testarm.glb');
  const scene = gltf.scene;
  const originalMaterials = useRef(new Map<string, THREE.Material>());

  const highlightMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 'yellow',
        emissive: 'orange',
        emissiveIntensity: 0.5,
      }),
    []
  );

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    console.log(`--- Model Dimension Debug ---`);
    console.log(`Size (Width, Height, Depth): X=${size.x.toFixed(3)}, Y=${size.y.toFixed(3)}, Z=${size.z.toFixed(3)}`);
    console.log(`Center Position: X=${center.x.toFixed(3)}, Y=${center.y.toFixed(3)}, Z=${center.z.toFixed(3)}`);
    console.log(`-----------------------------`);
  }, [scene]);

  useEffect(() => {
    scene.traverse((object) => {
      armConfig.forEach(joint => {
        if (object.name === joint.name) {
          const rotationValue = rotations[joint.name] || 0;
          if (joint.axis === 'x') object.rotation.x = rotationValue;
          if (joint.axis === 'y') object.rotation.y = rotationValue;
          if (joint.axis === 'z') object.rotation.z = rotationValue;
        }
      });
    });
  }, [scene, rotations]);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const shouldHighlight = highlightedMeshes.includes(object.name);
        const isHighlighted = originalMaterials.current.has(object.uuid);

        if (shouldHighlight && !isHighlighted) {
          originalMaterials.current.set(object.uuid, object.material);
          object.material = highlightMaterial;
        } else if (!shouldHighlight && isHighlighted) {
          object.material = originalMaterials.current.get(object.uuid)!;
          originalMaterials.current.delete(object.uuid);
        }
      }
    });
  }, [scene, highlightedMeshes, highlightMaterial]);

  return (
    <Center>
      <group>
        <primitive object={scene} scale={0.02} />
      </group>
    </Center>
  );
};

export default ArmModel;
