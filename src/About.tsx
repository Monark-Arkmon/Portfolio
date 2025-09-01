import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MoonModel } from './Moon';
import { useJsonAsset } from './utils/useAssets';
import SkillsMarquee from './components/skills-marquee';
import './About.css';

const About: React.FC = () => {
  // Load asset configurations from JSON
  const { data: heroConfig, loading: heroLoading } = useJsonAsset('hero.json');
  const { data: assetsConfig, loading: assetsLoading } = useJsonAsset('assets.json');
  const { data: aboutConfig, loading: aboutLoading } = useJsonAsset('about.json');

  // Parse hero data for responsive config
  const layoutData = heroConfig?.layout;
  const responsiveConfig = layoutData?.responsive;

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

  // Calculate responsive values for moon canvas
  const getMoonConfig = () => {
    const { width, height, isMobile, isTablet, isLaptop } = screenSize;

    // Return null if responsive config is not loaded yet
    if (!responsiveConfig) {
      return null;
    }
    
    // Calculate canvas dimensions based on layout - moon shows on all devices except mobile
    let canvasWidth, canvasHeight;
    
    if (isMobile) {
      // No moon canvas on mobile devices
      return null;
    } else if (isTablet) {
      canvasWidth = width;
      canvasHeight = Math.floor(height * 0.6); // 60% for bottom canvas
      
      return {
        cameraPosition: [0, 0, 10] as [number, number, number],
        modelPosition: [0, -5.5, 0] as [number, number, number],
        modelScale: 2.3,
        canvasWidth,
        canvasHeight,
        fov: 45
      };
    } else if (isLaptop) {
      canvasWidth = width;
      canvasHeight = Math.floor(height * 0.6); // 60% for bottom canvas
      
      return {
        cameraPosition: [0, 0, 12] as [number, number, number],
        modelPosition: [0, -6.7, 0] as [number, number, number],
        modelScale: 2.6,
        canvasWidth,
        canvasHeight,
        fov: 40
      };
    } else {
      canvasWidth = width;
      canvasHeight = Math.floor(height * 0.6); // 60% for bottom canvas
      
      return {
        cameraPosition: [0, 0, 15] as [number, number, number],
        modelPosition: [0, -9.5, 0] as [number, number, number],
        modelScale: 2,
        canvasWidth,
        canvasHeight,
        fov: 35
      };
    }
  };

  const moonConfig = getMoonConfig();

  // Don't render until all required data is loaded
  if (heroLoading || assetsLoading || aboutLoading || !heroConfig || !assetsConfig || !aboutConfig) {
    return <div>Loading...</div>;
  }

  // Dynamic CSS custom properties
  const dynamicStyles = {
    '--about-text-width-percent': screenSize.isMobile ? '100%' : '30%',
    '--skills-carousel-width-percent': screenSize.isMobile ? '100%' : '70%',
    '--top-section-height-percent': screenSize.isMobile ? '30%' : '40%',
    '--bottom-canvas-height-percent': screenSize.isMobile ? '70%' : '60%',
  } as React.CSSProperties;

  return (
    <div className="about-container" style={dynamicStyles}>
      {/* Top Section - 40% height, split into About (30%) and Skills Carousel (70%) */}
      <div className="about-top-section">
        {/* About Text Section - 30% width on desktop, full width on mobile */}
        <div className="about-text-section">
          <div className="about-text">
            <h2 className="about-title">{aboutConfig.about.title}</h2>
            <p className="about-description">
              {aboutConfig.about.description}
            </p>
          </div>
        </div>
        
        {/* Skills Carousel Section - 70% width on desktop, full width on mobile */}
        <div className="skills-carousel-section">
          <SkillsMarquee />
        </div>
      </div>
      
      {/* Bottom Section - 60% height, Moon Canvas */}
      <div className="about-bottom-section">
        {moonConfig && (
          <div className="moon-canvas">
            <Canvas 
              camera={{ 
                position: moonConfig.cameraPosition,
                fov: moonConfig.fov 
              }}
            >
              <MoonModel 
                position={moonConfig.modelPosition}
                scale={moonConfig.modelScale}
                canvasWidth={moonConfig.canvasWidth}
                canvasHeight={moonConfig.canvasHeight}
              />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
