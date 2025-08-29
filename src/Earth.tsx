import React, { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useJsonAsset, useTextureAssets } from "./utils/useAssets";

interface ModelProps {
  position?: [number, number, number];
  scale?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function Model({ position = [8, 0, 0], scale = 1, canvasWidth = 1920, canvasHeight = 1080 }: ModelProps) {
  // Load asset configuration from JSON
  const { data: assetsConfig } = useJsonAsset('assets.json');
  
  // Load texture URLs using the asset system
  const { data: textureUrls } = useTextureAssets(
    assetsConfig ? [
      assetsConfig.earth.textures.dayMap,
      assetsConfig.earth.textures.nightMap,
      assetsConfig.earth.textures.normalMap,
      assetsConfig.earth.textures.specularMap,
      assetsConfig.earth.textures.cloudsMap
    ] : null
  );

  const textures = useLoader(TextureLoader, textureUrls || []) as THREE.Texture[];
  const [colorMap, nightMap, normalMap, specularMap, cloudsMap] = textures;

  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const earthShaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Get rotation speeds from configuration
  const BASE_EARTH_ROTATION_SPEED = assetsConfig?.earth.animation.rotationSpeed;
  const BASE_CLOUDS_ROTATION_SPEED = assetsConfig?.earth.animation.cloudsRotationSpeed;

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += BASE_EARTH_ROTATION_SPEED;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += BASE_CLOUDS_ROTATION_SPEED;
    }
  });

  const EarthMaterial = useMemo(() => {
    // Get configuration values
    const lightDirection = assetsConfig?.earth.materials?.lightDirection 
      ? new THREE.Vector3(...assetsConfig.earth.materials.lightDirection).normalize()
      : new THREE.Vector3(1.0, 0.1, 0.0).normalize();
    const initialYRotation = assetsConfig?.earth.materials?.initialYRotation; 
    
    // Calculate responsive sizes based on canvas dimensions and scale
    const aspectRatio = canvasWidth / canvasHeight;
    
    // Base earth radius calculations based on canvas size
    const canvasMinDimension = Math.min(canvasWidth, canvasHeight);
    const baseRadius = canvasMinDimension * 0.012;
    
    // Apply scaling factor with better bounds
    const clampedScale = Math.max(0.8, Math.min(scale, 4));
    const finalRadius = baseRadius * clampedScale;
    
    const earthRadius = Math.max(6, Math.min(finalRadius, 25));
    const cloudsRadius = earthRadius * 1.005;
    
    console.log(`Canvas: ${canvasWidth}x${canvasHeight}, Earth radius: ${earthRadius}, Scale: ${clampedScale}`);

    return (
      <>
        <ambientLight intensity={5} color="#ffffff" />
        
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={5} 
          color="#f7ebb5"
          castShadow
        />
        
        <pointLight 
          color="#ffffff" 
          position={[2, 0, 5]} 
          intensity={5} 
          distance={15}
        />
  
        {/* Clouds Layer */}
        <mesh 
          ref={cloudsRef} 
          position={position}
          rotation={[0, initialYRotation, 0]} // Set initial rotation
        >
          <sphereGeometry args={[cloudsRadius, 32, 32]} />
          <meshPhongMaterial
            map={cloudsMap}
            opacity={0.3}
            depthWrite={true}
            transparent={true}
            side={THREE.DoubleSide}
            shininess={50}
          />
        </mesh>
        
        {/* Earth Mesh */}
        <mesh 
          ref={earthRef} 
          position={position}
          rotation={[0, initialYRotation, 0]} 
          castShadow 
          receiveShadow
        >
          <sphereGeometry args={[earthRadius, 32, 32]} />
          <shaderMaterial 
            ref={earthShaderMaterialRef}
            uniforms={{
              dayTexture: { value: colorMap },
              nightTexture: { value: nightMap },
              normalMap: { value: normalMap },
              specularMap: { value: specularMap },
              lightDirection: { value: lightDirection },
              nightIntensity: { value: 1 },
              terminatorBias: { value: -0.6 },
              textureOffsetY: { value: 0.2 },
              glowColor: { value: new THREE.Color(0.6, 0.8, 1.0) },
              glowIntensity: { value: 0.4 },
              glowPower: { value: 4.0 },
              transitionWidth: { value: 0.4 }
            }}
            vertexShader={`
              precision highp float;
              precision highp int;

              varying vec2 vUv;
              varying vec3 vWorldNormal;
              varying vec3 vWorldPosition;
              varying vec3 vViewDirection;
              
              void main() {
                vUv = uv;
                
                vec4 worldPositionVec4 = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPositionVec4.xyz;
                
                vWorldNormal = normalize(mat3(modelMatrix) * normal);
                
                vViewDirection = normalize(cameraPosition - vWorldPosition);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              precision highp float;
              precision highp int;

              uniform sampler2D dayTexture;
              uniform sampler2D nightTexture;
              uniform vec3 lightDirection;
              uniform float nightIntensity;
              uniform float terminatorBias;
              uniform float textureOffsetY;
              uniform float transitionWidth;

              uniform vec3 glowColor;
              uniform float glowIntensity;
              uniform float glowPower;

              varying vec2 vUv;
              varying vec3 vWorldNormal;
              varying vec3 vViewDirection;
              
              void main() {
                vec2 offsetUv = vec2(vUv.x, vUv.y + textureOffsetY);
                vec3 dayColorSample = texture2D(dayTexture, offsetUv).rgb;
                vec3 nightLightsSample = texture2D(nightTexture, offsetUv).rgb;
                
                float lightingFactor = dot(normalize(vWorldNormal), normalize(lightDirection));
                float halfTransitionWidth = transitionWidth / 2.0;
                float dayNightMix = smoothstep(-halfTransitionWidth + terminatorBias, halfTransitionWidth + terminatorBias, lightingFactor);
                vec3 enhancedNightLights = nightLightsSample * nightIntensity;
                
                vec3 finalColor = mix(enhancedNightLights, dayColorSample, 1.0 - dayNightMix);
                
                float fresnelDot = dot(normalize(vViewDirection), normalize(vWorldNormal));
                float fresnelEffect = pow(1.0 - clamp(fresnelDot, 0.0, 1.0), glowPower);
                vec3 atmosphereGlow = glowColor * fresnelEffect * glowIntensity;
                
                finalColor += atmosphereGlow;
                
                gl_FragColor = vec4(finalColor, 1.0);
              }
            `}
          />
        </mesh>
      </>
    );
  }, [colorMap, nightMap, normalMap, specularMap, cloudsMap, position, scale, canvasWidth, canvasHeight, assetsConfig]);

  // Don't render until we have both textures and config
  if (!textureUrls || !assetsConfig || textures.length === 0) {
    return null;
  }

  return (
    <group>
      {EarthMaterial}
    </group>
  );
}