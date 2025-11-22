
'use client'
import Image from "next/image";
import Link from "next/link";
import FaultyTerminal from "@/components/FaultyTerminal";

export default function Home() {
	return (
		<div className="relative w-full h-full">

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
		</div>
	);
}; 
