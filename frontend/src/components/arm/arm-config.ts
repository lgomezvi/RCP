import { ArmRotations } from './types';

export interface JointConfig {
	name: keyof ArmRotations;
	label: string;
	axis: 'x' | 'y' | 'z';
	step: number;
}

export const armConfig: JointConfig[] = [
	{ name: 'Base', label: 'Base', axis: 'y', step: Math.PI / 16 },
	{ name: 'Waist', label: 'Waist', axis: 'y', step: Math.PI / 16 },
	{ name: 'Arm_02_v3', label: 'Shoulder', axis: 'z', step: Math.PI / 16 },
	{ name: 'nodes14', label: 'Elbow', axis: 'z', step: Math.PI / 16 },
];
