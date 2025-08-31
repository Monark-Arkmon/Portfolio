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
    const shininess = assetsConfig?.moon.materials?.shininess;
    
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
        {/* Ambient light for overall illumination */}
        <ambientLight intensity={0.3} color="#ffffff" />
        
        {/* Directional light from higher up (simulating sunlight from user/screen side) */}
        <directionalLight 
          position={lightDirection as [number, number, number]} 
          intensity={2} 
          color="#f7f7f7"
          castShadow
        />
        
        {/* Additional point light for subtle rim lighting */}
        <pointLight 
          color="#ffffff" 
          position={[2, 3, 4]} 
          intensity={1} 
          distance={15}
        />
  
        {/* Moon Mesh */}
        <mesh 
          ref={moonRef} 
          position={position}
          castShadow 
          receiveShadow
        >
          <sphereGeometry args={[moonRadius, 32, 32]} />
          <meshPhongMaterial
            map={moonMap}
            shininess={shininess} // Use shininess from config
            specular={new THREE.Color(0x111111)} // Very low specular reflection
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
