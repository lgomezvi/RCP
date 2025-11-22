'use client'
import Image from "next/image";
import Link from "next/link";
import FaultyTerminal from "@/components/FaultyTerminal";
import GlitchText from '@/components/GlitchText';

  
export default function Home() {
	return (
		<div className="flex relative justify-center items-center w-full h-full">

  			<FaultyTerminal
				scale={1.5}
				gridMul={[2, 1]}
				digitSize={1.2}
				timeScale={1}
				pause={false}
				scanlineIntensity={1}
				glitchAmount={1}
				flickerAmount={1}
				noiseAmp={1}
				chromaticAberration={0}
				dither={0}
				curvature={0.1}
				tint="#65F736"
				mouseReact={true}
				mouseStrength={0.5}
				pageLoadAnimation={true} 
				brightness={0.6}
				className="h-full" />

			<div className="flex absolute flex-col gap-4 items-center">
				<GlitchText
					speed={1}
					enableShadows={true}
					enableOnHover={false}
					className='text-3xl whitespace-nowrap md:text-6xl lg:text-7xl'>
					Robot Context Protocol 
				</GlitchText>
				<div className="flex gap-4">
					<Link href="/calibrating" className="text-white hover:underline">Calibrating</Link>
					<Link href="/demo" className="text-white hover:underline">Demo</Link>
					<Link href="/presentation" className="text-white hover:underline">What is It?</Link>

				</div>
			</div>

		</div>
	);
}; 
