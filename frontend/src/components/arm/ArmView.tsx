'use client';

import React, { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import ArmModel from "./ArmModel";
import Controls from "./controls";
import { ArmRotations } from "./types";
import { armConfig } from "./arm-config";

export default function ArmView() {
  const initialRotations: ArmRotations = armConfig.reduce((acc, joint) => {
    acc[joint.name] = 0;
    return acc;
  }, {} as ArmRotations);

  const [rotations, setRotations] = useState<ArmRotations>(initialRotations);

  return (
    <div className="relative mx-auto w-full h-full bg-white">
      <Canvas className="mx-auto w-full h-full"
        camera={{ fov: 75 }}
      >
        <ambientLight intensity={0.8}></ambientLight>
        <GizmoHelper
          alignment="bottom-right"
          margin={[80, 80]}
        >
          <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="black" />
        </GizmoHelper>
        <ArmModel rotations={rotations} />
        <OrbitControls />
      </Canvas>
      <Controls setRotations={setRotations} />
    </div>
  );
}
