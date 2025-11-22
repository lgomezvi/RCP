'use client';

import React from 'react';
import { ArmRotations } from './types';
import { armConfig } from './arm-config'; // Import armConfig

const Controls = ({ setRotations }: { setRotations: React.Dispatch<React.SetStateAction<ArmRotations>> }) => {
	const adjustRotation = (jointName: keyof ArmRotations, angle: number) => {
		setRotations(prev => ({
			...prev,
			[jointName]: (prev[jointName] || 0) + angle, // Ensure initial value is 0 if undefined
		}));
	};

	return (
		<div className="absolute top-2 left-2 bg-black p-2 rounded-md">
			<h3 className="text-white text-lg mb-2">Arm Controls</h3>
			{armConfig.map((joint) => (
				<div key={joint.name} className="mb-2">
					<h4 className="text-white">{joint.label}</h4>
					<div className="flex space-x-2">
						<button 
							onClick={() => adjustRotation(joint.name, joint.step)}
							className="bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-600"
						>
							+
						</button>
						<button 
							onClick={() => adjustRotation(joint.name, -joint.step)}
							className="bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-600"
						>
							-
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

export default Controls;
