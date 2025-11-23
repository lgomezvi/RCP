import { ArmRotations } from './types';

export interface JointConfig {
	name: keyof ArmRotations;
	label: string;
	axis: 'x' | 'y' | 'z';
	step: number;
}

export const armConfig: JointConfig[] = [
	{ name: 'gear1', label: 'TEST', axis: 'y', step: Math.PI / 16 },
	{ name: 'Waist', label: 'Waist', axis: 'y', step: Math.PI / 16 },
	{ name: 'Arm_03_node', label: 'Shoulder', axis: 'z', step: Math.PI / 16 },
	{ name: 'nodes33', label: 'Elbow', axis: 'z', step: Math.PI / 16 },
];
