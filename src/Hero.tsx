import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Model as EarthModel } from './Earth';
import BouncingAstronaut from './BouncingAstronaut';
import './Hero.css';

const Hero: React.FC = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth <= 1024 && window.innerWidth > 768 : false,
    isLaptop: typeof window !== 'undefined' ? window.innerWidth <= 1440 && window.innerWidth > 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth > 1440 : false
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({
        width,
        height,
        isMobile: width <= 768,
        isTablet: width <= 1024 && width > 768,
        isLaptop: width <= 1440 && width > 1024,
        isDesktop: width > 1440
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive values - only for tablet, laptop, and desktop
  const getResponsiveConfig = () => {
    const { width, height, isMobile, isTablet, isLaptop } = screenSize;

    // Don't render canvas on mobile
    if (isMobile) {
      return null;
    }
    
    // Calculate canvas dimensions based on layout
    let canvasWidth, canvasHeight;
    
    if (isTablet) {
      // Tablet: canvas takes 60% width in row layout  
      canvasWidth = width * 0.6;
      canvasHeight = height;
      
      return {
        cameraPosition: [0, 0, 25] as [number, number, number],
        modelPosition: [8, 0, 0] as [number, number, number],
        modelScale: 1.8,
        canvasWidth,
        canvasHeight,
        fov: 55
      };
    } else if (isLaptop) {
      // Laptop: canvas takes 62% width in row layout
      canvasWidth = width * 0.62;
      canvasHeight = height;
      
      return {
        cameraPosition: [0, 0, 24] as [number, number, number],
        modelPosition: [7, 0, 0] as [number, number, number],
        modelScale: 1.5,
        canvasWidth,
        canvasHeight,
        fov: 52
      };
    } else {
      // Desktop: canvas takes 65% width in row layout
      canvasWidth = width * 0.65;
      canvasHeight = height;
      
      return {
        cameraPosition: [0, 0, 22] as [number, number, number],
        modelPosition: [6, 0, 0] as [number, number, number],
        modelScale: 0.95,
        canvasWidth,
        canvasHeight,
        fov: 50
      };
    }
  };

  // Helper function to get screen type for astronaut sizing
  const getScreenType = (): 'mobile' | 'tablet' | 'laptop' | 'desktop' => {
    const { isMobile, isTablet, isLaptop } = screenSize;
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isLaptop) return 'laptop';
    return 'desktop';
  };

  const config = getResponsiveConfig();

  return (
    <div className="hero-container">
      <div className="hero-content">
        {/* Astronaut Animation Section - Top 65% for tablet/laptop/desktop, 50% for mobile */}
        <div className="hero-astronaut-section">
          <BouncingAstronaut 
            containerWidth={screenSize.isMobile ? screenSize.width : screenSize.width * 0.35}
            containerHeight={screenSize.isMobile ? screenSize.height * 0.5 : screenSize.height * 0.65}
            screenType={getScreenType()}
          />
        </div>
        
        {/* Text Content Section - Bottom 35% for tablet/laptop/desktop, 50% for mobile */}
        <div className="hero-text-section">
          <div className="hero-text">
            <h1>Welcome to My Portfolio</h1>
            <p>I'm a developer passionate about creating amazing experiences</p>
            <button className="cta-button">Get In Touch</button>
          </div>
        </div>
      </div>
      {config && (
        <div className="hero-canvas">
          <Canvas 
            camera={{ 
              position: config.cameraPosition,
              fov: config.fov 
            }}
          >
            <EarthModel 
              position={config.modelPosition}
              scale={config.modelScale}
              canvasWidth={config.canvasWidth}
              canvasHeight={config.canvasHeight}
            />
          </Canvas>
        </div>
      )}
    </div>
  );
};

export default Hero;
