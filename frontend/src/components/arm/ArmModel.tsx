'use client';

import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useEffect } from 'react';
import * as THREE from 'three';
import { Center } from '@react-three/drei';

import { ArmRotations } from './types';
import { armConfig } from './arm-config'; // Import armConfig

const ArmModel = ({ rotations }: { rotations: ArmRotations }) => {

	const gltf = useLoader(GLTFLoader, '/testarm.glb')
	const scene = gltf.scene;

	useEffect(() => {
		// 1. Create a bounding box object
		const box = new THREE.Box3();
		// 2. Compute the box that tightly encloses the model's scene
		box.setFromObject(scene);
		// 3. Calculate size and center
		const size = new THREE.Vector3();
		box.getSize(size);
		const center = new THREE.Vector3();
		box.getCenter(center);

		// Log the results to your console (F12)
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
			const type = object.constructor.name; // Get the type of the object (e.g., Mesh, Group, Object3D)
			const parentName = object.parent ? object.parent.name : 'No Parent';
			console.log(`Name: ${object.name}, Type: ${type}, Parent: ${parentName}`);
		});
	}, [scene]);


	return (
		<Center>
			<group>
				<primitive object={scene} scale={0.02} />
			</group>
		</Center>
	)
}

export default ArmModel;
