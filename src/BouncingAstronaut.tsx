import React, { useState, useEffect, useRef } from 'react';
import { useJsonAsset, useImageAsset } from './utils/useAssets';
import './BouncingAstronaut.css';

interface BouncingAstronautProps {
  containerWidth: number;
  containerHeight: number;
  screenType?: 'mobile' | 'tablet' | 'laptop' | 'desktop';
}

const BouncingAstronaut: React.FC<BouncingAstronautProps> = ({ containerWidth, containerHeight, screenType = 'desktop' }) => {
  // Load asset configuration from JSON
  const { data: assetsConfig, loading: configLoading } = useJsonAsset('assets.json');
  
  // Load astronaut image using the asset system
  const { data: astronautImageUrl, loading: imageLoading } = useImageAsset(
    assetsConfig?.astronaut?.image || null
  );

  const astronautRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Responsive astronaut sizing based on screen type and config
  const getAstronautSize = () => {
    if (!assetsConfig) return null;
    return assetsConfig.astronaut.sizes[screenType];
  };
  
  // Generate random initial velocity with varying speeds using config
  const generateRandomVelocity = () => {
    if (!assetsConfig) return { x: 1, y: 1 };
    const config = assetsConfig.astronaut.animation;
    const minSpeed = config.initialVelocity.min;
    const maxSpeed = config.initialVelocity.max;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    const angle = Math.random() * 2 * Math.PI; // Random direction
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
  };
  
  const velocityRef = useRef(generateRandomVelocity());
  const timeRef = useRef(0);
  
  // Responsive astronaut size
  const ASTRONAUT_SIZE = getAstronautSize();
  const COLLISION_BUFFER = 10;
  
  // Position state
  const [position, setPosition] = useState({
    x: Math.random() * Math.max(0, containerWidth - ASTRONAUT_SIZE - COLLISION_BUFFER * 2) + COLLISION_BUFFER,
    y: Math.random() * Math.max(0, containerHeight - ASTRONAUT_SIZE - COLLISION_BUFFER * 2) + COLLISION_BUFFER
  });

  // Regenerate velocity when config becomes available
  useEffect(() => {
    if (assetsConfig && assetsConfig.astronaut) {
      velocityRef.current = generateRandomVelocity();
    }
  }, [assetsConfig]);

  useEffect(() => {
    // Don't start animation until we have all required data
    if (configLoading || imageLoading || !assetsConfig || !astronautImageUrl) {
      return;
    }

    const animate = () => {
      setPosition(prevPos => {
        timeRef.current += 0.01; // Increment time for wave functions
        
        // Mathematical perturbations using sine waves and noise
        const waveAmplitude = 0.15;
        const noiseAmplitude = 0.08;
        
        // Multi-frequency wave motion for organic floating
        const sineWaveX = Math.sin(timeRef.current * 0.7) * waveAmplitude;
        const cosWaveY = Math.cos(timeRef.current * 0.5) * waveAmplitude;
        const noiseX = (Math.random() - 0.5) * noiseAmplitude;
        const noiseY = (Math.random() - 0.5) * noiseAmplitude;
        
        // Combine base velocity with mathematical perturbations
        const totalVelX = velocityRef.current.x + sineWaveX + noiseX;
        const totalVelY = velocityRef.current.y + cosWaveY + noiseY;
        
        let newX = prevPos.x + totalVelX;
        let newY = prevPos.y + totalVelY;

        // Redesigned collision detection with buffer zones
        const leftBoundary = COLLISION_BUFFER;
        const rightBoundary = containerWidth - ASTRONAUT_SIZE - COLLISION_BUFFER - 5;
        const topBoundary = COLLISION_BUFFER;
        const bottomBoundary = containerHeight - ASTRONAUT_SIZE - COLLISION_BUFFER - 5;

        // Collision handling with random speed generation
        if (newX <= leftBoundary) {
          const newSpeed = 0.5 + Math.random() * 0.1;
          velocityRef.current.x = newSpeed;
          newX = leftBoundary;
          // Add random Y component on collision
          velocityRef.current.y += Math.random()* 0.1;
        }
        
        if (newX >= rightBoundary) {
          const newSpeed = 0.5 + Math.random() * 0.1;
          velocityRef.current.x = -newSpeed;
          newX = rightBoundary;
          // Add random Y component on collision
          velocityRef.current.y += (Math.random() - 0.5) * 0.1;
        }
        
        if (newY <= topBoundary) {
          const newSpeed = 0.5 + Math.random() * 0.1;
          velocityRef.current.y = newSpeed;
          newY = topBoundary;
          // Add random X component on collision
          velocityRef.current.x += Math.random() * 0.1;
        }
        
        if (newY >= bottomBoundary) {
          const newSpeed = 0.5 + Math.random() * 0.1;
          velocityRef.current.y = -newSpeed;
          newY = bottomBoundary;
          // Add random X component on collision
          velocityRef.current.x += (Math.random() - 0.5) * 0.1;
        }

        // Apply slight velocity decay and random perturbations over time
        velocityRef.current.x *= 0.9998;
        velocityRef.current.y *= 0.9998;
        
        // Random micro-accelerations
        if (Math.random() < 0.01) { // 1% chance each frame
          velocityRef.current.x += (Math.random() - 0.5) * 0.1;
          velocityRef.current.y += (Math.random() - 0.5) * 0.1;
        }

        // Clamp velocities to reasonable ranges
        const maxSpeed = 3.0;
        const minSpeed = 0.2;
        
        const currentSpeed = Math.sqrt(velocityRef.current.x * velocityRef.current.x + velocityRef.current.y * velocityRef.current.y);
        if (currentSpeed > maxSpeed) {
          velocityRef.current.x = (velocityRef.current.x / currentSpeed) * maxSpeed;
          velocityRef.current.y = (velocityRef.current.y / currentSpeed) * maxSpeed;
        } else if (currentSpeed < minSpeed) {
          const newVel = generateRandomVelocity();
          velocityRef.current.x = newVel.x;
          velocityRef.current.y = newVel.y;
        }

        return { x: newX, y: newY };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerWidth, containerHeight, configLoading, imageLoading, assetsConfig, astronautImageUrl]);

  // Reset position when container size changes
  useEffect(() => {
    setPosition(prev => ({
      x: Math.min(prev.x, Math.max(COLLISION_BUFFER, containerWidth - ASTRONAUT_SIZE - COLLISION_BUFFER)),
      y: Math.min(prev.y, Math.max(COLLISION_BUFFER, containerHeight - ASTRONAUT_SIZE - COLLISION_BUFFER))
    }));
  }, [containerWidth, containerHeight, ASTRONAUT_SIZE, COLLISION_BUFFER]);

  // Don't render until we have all the required data
  if (configLoading || imageLoading || !assetsConfig || !astronautImageUrl) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className="astronaut-container"
      style={{ width: containerWidth, height: containerHeight }}
    >
      <img
        ref={astronautRef}
        src={astronautImageUrl || undefined}
        alt="Bouncing Astronaut"
        className="bouncing-astronaut"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: ASTRONAUT_SIZE,
          height: ASTRONAUT_SIZE
        }}
        onError={() => {
          console.warn('Astronaut image failed to load');
        }}
      />
    </div>
  );
};

export default BouncingAstronaut;
