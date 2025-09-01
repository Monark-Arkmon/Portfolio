import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useJsonAsset, useTextureAssetsFromPaths } from "./utils/useAssets";

interface MoonModelProps {
  position?: [number, number, number];
  scale?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function MoonModel({ position = [0, 0, 0], scale = 1, canvasWidth = 1920, canvasHeight = 1080 }: MoonModelProps) {
  // Load asset configuration from JSON
  const { data: assetsConfig } = useJsonAsset('assets.json');
  
  // Load moon texture using the path-based asset system
  const { data: textureUrls } = useTextureAssetsFromPaths(
    assetsConfig ? [assetsConfig.moon.textures.map] : null
  );

  const textures = useLoader(TextureLoader, textureUrls || []) as THREE.Texture[];
  const [moonMap] = textures;

  const moonRef = useRef<THREE.Mesh>(null);

  // Get rotation speed from configuration
  const MOON_ROTATION_SPEED = assetsConfig?.moon.animation.rotationSpeed || 0.002;

  useFrame(() => {
    if (moonRef.current) {
      // Rotate around X-axis for top-to-bottom rotation
      moonRef.current.rotation.x += MOON_ROTATION_SPEED;
    }
  });

  const MoonMaterial = useMemo(() => {
    // Get configuration values
    const lightDirection = assetsConfig?.moon.materials?.lightDirection 
      ? assetsConfig.moon.materials.lightDirection
      : [0.0, 1.0, 0.5];
    
    // Base moon radius calculations based on canvas size
    const canvasMinDimension = Math.min(canvasWidth, canvasHeight);
    const baseRadius = canvasMinDimension * 0.008;
    
    // Apply scaling factor
    const clampedScale = Math.max(0.5, Math.min(scale, 3));
    const finalRadius = baseRadius * clampedScale;
    
    const moonRadius = Math.max(4, Math.min(finalRadius, 20));
    
    console.log(`Canvas: ${canvasWidth}x${canvasHeight}, Moon radius: ${moonRadius}, Scale: ${clampedScale}`);

    return (
      <>
        {/* Ambient light for subtle base illumination */}
        <ambientLight intensity={0.15} color="#e6e6fa" />
        
        {/* Main directional light (sun) */}
        <directionalLight 
          position={[lightDirection[0] * 5, lightDirection[1] * 5, lightDirection[2] * 5]} 
          intensity={1.8} 
          color="#fff8dc"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Secondary fill light to reduce harsh shadows */}
        <directionalLight 
          position={[-lightDirection[0] * 2, lightDirection[1] * 2, lightDirection[2] * 3]} 
          intensity={0.4} 
          color="#b3c6ff"
        />
        
        {/* Rim light for edge definition */}
        <pointLight 
          color="#ffffff" 
          position={[lightDirection[0] * 3, lightDirection[1] * 4, lightDirection[2] * 6]} 
          intensity={0.8} 
          distance={25}
          decay={2}
        />
  
        {/* Moon Mesh with higher resolution geometry */}
        <mesh 
          ref={moonRef} 
          position={position}
          castShadow 
          receiveShadow
        >
          {/* Higher resolution sphere for smoother edges */}
          <sphereGeometry args={[moonRadius, 64, 64]} />
          <meshStandardMaterial
            map={moonMap}
            roughness={0.9} // Moon surface is quite rough
            metalness={0.02} // Very slight metallic properties
            normalScale={new THREE.Vector2(0.8, 0.8)} // If we had a normal map
            bumpScale={0.02} // Use the diffuse map as a bump map for surface detail
            emissive={new THREE.Color(0x000000)} // No self-emission
            emissiveIntensity={0}
            side={THREE.FrontSide}
          />
        </mesh>
      </>
    );
  }, [moonMap, position, scale, canvasWidth, canvasHeight, assetsConfig]);

  // Don't render until we have both texture and config
  if (!textureUrls || !assetsConfig || textures.length === 0) {
    return null;
  }

  return (
    <group>
      {MoonMaterial}
    </group>
  );
}
