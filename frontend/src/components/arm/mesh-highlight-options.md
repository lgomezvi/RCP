# Highlighting Meshes Dynamically in React Three Fiber

Here are a few options for highlighting a mesh dynamically to signify movement, ranging from simple color changes to more complex effects.

### 1. Color Change

This is the most straightforward approach. You can change the color of the mesh's material to a brighter or more saturated color when it's "active" and then fade it back to its original color.

*   **API:** You can use the `color` property of the mesh's `material`.
*   **Animation:** You can use a library like `gsap` or `react-spring` to smoothly transition the color.

**Example (using `react-spring`):**

```tsx
import { useSpring, animated } from '@react-spring/three';

function MyMesh({ active }) {
  const { color } = useSpring({
    color: active ? 'hotpink' : 'blue',
  });

  return (
    <animated.mesh>
      <meshStandardMaterial color={color} />
    </animated.mesh>
  );
}
```

### 2. Emissive Intensity

You can make the mesh "glow" by increasing the `emissive` property of its material. This will make the mesh appear to emit light.

*   **API:** You can use the `emissive` and `emissiveIntensity` properties of the mesh's `material`.
*   **Animation:** You can animate the `emissiveIntensity` from 0 to a higher value and then back to 0.

**Example (using `gsap`):**

```tsx
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';

function MyMesh({ active }) {
  const meshRef = useRef();

  useEffect(() => {
    if (active) {
      gsap.to(meshRef.current.material, {
        emissiveIntensity: 2,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
      });
    }
  }, [active]);

  return (
    <mesh ref={meshRef}>
      <meshStandardMaterial emissive="orange" emissiveIntensity={0} />
    </mesh>
  );
}
```

### 3. Wireframe

You can temporarily show the wireframe of the mesh to highlight its geometry.

*   **API:** You can set the `wireframe` property of the mesh's `material` to `true`.
*   **Animation:** You can toggle the `wireframe` property on and off.

**Example:**

```tsx
function MyMesh({ active }) {
  return (
    <mesh>
      <meshStandardMaterial wireframe={active} />
    </mesh>
  );
}
```

### 4. Outline Effect

For a more advanced effect, you can add an outline to the mesh. This is a bit more involved and usually requires post-processing.

*   **API:** You can use the `EffectComposer` and `Outline` pass from `@react-three/postprocessing`.
*   **Animation:** You can add and remove meshes from the outline selection.

**Example:**

```tsx
import { EffectComposer, Outline } from '@react-three/postprocessing';

function MyScene() {
  const [activeMesh, setActiveMesh] = useState(null);

  return (
    <>
      <MyMesh onPointerOver={() => setActiveMesh(ref)} onPointerOut={() => setActiveMesh(null)} />
      <EffectComposer>
        <Outline selection={activeMesh ? [activeMesh] : []} />
      </EffectComposer>
    </>
  );
}
```
