import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useJsonAsset, useTextureAssetsFromPaths } from "./utils/useAssets";

interface ModelProps {
  position?: [number, number, number];
  scale?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function Model({ position = [8, 0, 0], scale = 1, canvasWidth = 1920, canvasHeight = 1080 }: ModelProps) {
  // Load asset configuration from JSON
  const { data: assetsConfig } = useJsonAsset('assets.json');
  
  // Load texture URLs using the new path-based asset system
  const { data: textureUrls } = useTextureAssetsFromPaths(
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
  const cloudsShaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

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
    
    // Base earth radius calculations based on canvas size
    const canvasMinDimension = Math.min(canvasWidth, canvasHeight);
    const baseRadius = canvasMinDimension * 0.012;
    
    // Apply scaling factor with better bounds
    const clampedScale = Math.max(0.8, Math.min(scale, 4));
    const finalRadius = baseRadius * clampedScale;
    
    const earthRadius = Math.max(6, Math.min(finalRadius, 25));
    const cloudsRadius = earthRadius * 1.002; // Much closer to surface
    
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
  
        {/* Earth Mesh - Render first */}
        <mesh 
          ref={earthRef} 
          position={position}
          rotation={[0, initialYRotation, 0]} 
          castShadow 
          receiveShadow
        >
          <sphereGeometry args={[earthRadius, 64, 64]} />
          <shaderMaterial 
            ref={earthShaderMaterialRef}
            uniforms={{
              dayTexture: { value: colorMap },
              nightTexture: { value: nightMap },
              normalMap: { value: normalMap },
              specularMap: { value: specularMap },
              lightDirection: { value: lightDirection },
              nightIntensity: { value: 1 },
              terminatorBias: { value: -0.55 },
              textureOffsetY: { value: 0.2 },
              glowColor: { value: new THREE.Color(248 / 255, 225 / 255, 178 / 255) },
              glowIntensity: { value: 0.4 },
              glowPower: { value: 4.0 },
              transitionWidth: { value: 0.2 }
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

        {/* Clouds Layer - Render after Earth for proper transparency */}
        <mesh 
          ref={cloudsRef}
          position={position}
          rotation={[0, initialYRotation, 0]}
          renderOrder={1}
        >
          <sphereGeometry args={[cloudsRadius, 64, 64]} />
          <shaderMaterial
            ref={cloudsShaderMaterialRef}
            uniforms={{
              cloudsTexture: { value: cloudsMap },
              lightDirection: { value: lightDirection },
              opacity: { value: 1.0 },
              atmosphereColor: { value: new THREE.Color(0.8, 0.9, 1.0) },
              cloudWhiteness: { value: 1.5 },
              cloudBrightness: { value: 1.2 },
              baseCloudColor: { value: new THREE.Color(1.0, 1.0, 1.0) }
            }}
            transparent={true}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.NormalBlending}
            vertexShader={`
              precision highp float;
              
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
              
              uniform sampler2D cloudsTexture;
              uniform vec3 lightDirection;
              uniform float opacity;
              uniform vec3 atmosphereColor;
              uniform float cloudWhiteness;
              uniform float cloudBrightness;
              uniform vec3 baseCloudColor;
              
              varying vec2 vUv;
              varying vec3 vWorldNormal;
              varying vec3 vViewDirection;
              
              void main() {
                vec3 cloudsSample = texture2D(cloudsTexture, vUv).rgb;
                
                // Calculate lighting factor
                float lightingFactor = max(0.2, dot(normalize(vWorldNormal), normalize(lightDirection)));
                
                // Calculate fresnel effect for atmospheric blending
                float fresnelDot = dot(normalize(vViewDirection), normalize(vWorldNormal));
                float fresnelEffect = 1.0 - clamp(fresnelDot, 0.0, 1.0);
                
                // Make clouds whiter by mixing with pure white
                vec3 whitenedClouds = mix(cloudsSample, baseCloudColor, cloudWhiteness * 0.6);
                
                // Apply brightness enhancement
                whitenedClouds *= cloudBrightness;
                
                // Subtle atmospheric scattering effect (reduced influence)
                vec3 atmosphericGlow = atmosphereColor * fresnelEffect * 0.15;
                
                // Combine clouds with minimal atmospheric effects to maintain whiteness
                vec3 finalColor = mix(whitenedClouds, whitenedClouds + atmosphericGlow, fresnelEffect * 0.3);
                
                // Ensure clouds stay bright and white
                finalColor = clamp(finalColor, 0.0, 1.0);
                
                // Dynamic opacity based on cloud density and lighting
                float cloudDensity = (cloudsSample.r + cloudsSample.g + cloudsSample.b) / 3.0;
                float dynamicOpacity = opacity * cloudDensity * (0.4 + 0.6 * lightingFactor);
                
                gl_FragColor = vec4(finalColor, dynamicOpacity);
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