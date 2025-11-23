'use client';

import React, { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import ArmModel from "./ArmModel";
import { ArmRotations } from "./types";
import { armConfig } from "./arm-config";

interface ArmViewProps {
  highlightedMeshes?: string[];
}

export default function ArmView({ highlightedMeshes }: ArmViewProps) {
  const initialRotations: ArmRotations = armConfig.reduce((acc, joint) => {
    acc[joint.name] = 0;
    return acc;
  }, {} as ArmRotations);

  const [rotations, setRotations] = useState<ArmRotations>(initialRotations);
  const [isRotating, setIsRotating] = useState(true);

  return (
    <div className="relative mx-auto w-full h-full bg-card">
      <Canvas className="mx-auto w-full h-full"
        camera={{ fov: 75 }}
      >
        <ambientLight intensity={0.8}></ambientLight>
        <GizmoHelper
          alignment="bottom-right"
          margin={[80, 80]}
        >
        </GizmoHelper>
        <ArmModel 
          rotations={rotations} 
          highlightedMeshes={highlightedMeshes} 
          isRotating={isRotating}
        />
        <OrbitControls 
          onStart={() => setIsRotating(false)}
          onEnd={() => setIsRotating(true)}
        />
      </Canvas>
    </div>
  );
}
