import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Model as EarthModel } from './Earth';
import BouncingAstronaut from './BouncingAstronaut';
import { useJsonAsset, useDocumentAssetFromPath } from './utils/useAssets';
import TextMorph from './components/text-morph';
import { ShimmerButton } from './components/shimmer-button';
import { InteractiveHoverButton } from './components/interactive-hover-button';
import './Hero.css';

const Hero: React.FC = () => {
  // Load asset configurations from JSON
  const { data: heroConfig, loading: heroLoading } = useJsonAsset('hero.json');
  const { data: assetsConfig, loading: assetsLoading } = useJsonAsset('assets.json');

  // Parse hero data for easy access
  const personalData = heroConfig?.personal;
  const heroData = heroConfig?.hero;
  const layoutData = heroConfig?.layout;
  const responsiveConfig = layoutData?.responsive;

  // Parse assets data for easy access  
  const documentsData = assetsConfig?.documents;
  
  // Get CV URL from AssetManager
  const { data: cvUrl } = useDocumentAssetFromPath(documentsData?.cv || null);

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

    // Return null if responsive config is not loaded yet
    if (!responsiveConfig) {
      return null;
    }
    
    // Calculate canvas dimensions based on layout
    let canvasWidth, canvasHeight;
    let config;
    
    if (isTablet) {
      config = responsiveConfig.tablet;
      const containerWidth = width * config.canvasWidthPercent;
      canvasWidth = Math.floor(containerWidth);
      canvasHeight = height;
      
      return {
        cameraPosition: config.cameraPosition as [number, number, number],
        modelPosition: config.modelPosition as [number, number, number],
        modelScale: config.modelScale,
        canvasWidth,
        canvasHeight,
        fov: config.fov
      };
    } else if (isLaptop) {
      config = responsiveConfig.laptop;
      const containerWidth = width * config.canvasWidthPercent;
      canvasWidth = Math.floor(containerWidth);
      canvasHeight = height;
      
      return {
        cameraPosition: config.cameraPosition as [number, number, number],
        modelPosition: config.modelPosition as [number, number, number],
        modelScale: config.modelScale,
        canvasWidth,
        canvasHeight,
        fov: config.fov
      };
    } else {
      config = responsiveConfig.desktop;
      const containerWidth = width * config.canvasWidthPercent;
      canvasWidth = Math.floor(containerWidth);
      canvasHeight = height;
      
      return {
        cameraPosition: config.cameraPosition as [number, number, number],
        modelPosition: config.modelPosition as [number, number, number],
        modelScale: config.modelScale,
        canvasWidth,
        canvasHeight,
        fov: config.fov
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

  // Don't render until all required data is loaded
  if (heroLoading || assetsLoading || !heroConfig || !assetsConfig) {
    return <div>Loading...</div>;
  }

  // Get current responsive configuration
  const getCurrentConfig = () => {
    if (screenSize.isMobile) return responsiveConfig?.mobile;
    if (screenSize.isTablet) return responsiveConfig?.tablet;
    if (screenSize.isLaptop) return responsiveConfig?.laptop;
    return responsiveConfig?.desktop;
  };

  const currentConfig = getCurrentConfig();

  // Handle button actions
  const handleContactClick = () => {
    if (personalData?.email) {
      window.location.href = `mailto:${personalData.email}`;
    }
  };

  const handleDownloadCV = () => {
    if (cvUrl) {
      // Use the proper CV URL from AssetManager
      const link = document.createElement('a');
      link.href = cvUrl;
      link.download = 'CV_Arkapratim_Mondal.pdf';
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Dynamic CSS custom properties
  const dynamicStyles = {
    '--astronaut-height-percent': `${(currentConfig?.astronautSectionHeightPercent || 0.6) * 100}%`,
    '--text-height-percent': `${(currentConfig?.textSectionHeightPercent || 0.4) * 100}%`,
    '--content-width-percent': `${((1 - (currentConfig?.canvasWidthPercent || 0.65)) * 100).toFixed(1)}%`,
    '--canvas-width-percent': `${((currentConfig?.canvasWidthPercent || 0.65) * 100).toFixed(1)}%`,
  } as React.CSSProperties;

  return (
    <div className="hero-container" style={dynamicStyles}>
      <div className="hero-content">
        {/* Astronaut Animation Section - Using responsive config */}
        <div className="hero-astronaut-section">
          <BouncingAstronaut 
            containerWidth={screenSize.isMobile 
              ? screenSize.width * (responsiveConfig?.mobile?.astronautContainerWidthPercent)
              : screenSize.width * (responsiveConfig?.[screenSize.isTablet ? 'tablet' : screenSize.isLaptop ? 'laptop' : 'desktop']?.astronautContainerWidthPercent)
            }
            containerHeight={screenSize.isMobile 
              ? screenSize.height * (responsiveConfig?.mobile?.astronautSectionHeightPercent)
              : screenSize.height * (responsiveConfig?.[screenSize.isTablet ? 'tablet' : screenSize.isLaptop ? 'laptop' : 'desktop']?.astronautSectionHeightPercent)
            }
            screenType={getScreenType()}
          />
        </div>
        
        {/* Text Content Section - Using hero data from JSON */}
        <div className="hero-text-section">
          <div className="hero-text">
            {/* Title with name */}
            <h1 className="hero-title fade-in-up">
              {heroData?.title} {personalData?.name}
            </h1>
            
            {/* Morphing titles animation */}
            <div className="morphing-titles fade-in-up-delay-1">
              <TextMorph 
                texts={personalData?.titles || []}
                morphDelay={2.5}
              />
            </div>
            
            {/* Action buttons */}
            <div className="hero-buttons fade-in-up-delay-2">
              <ShimmerButton className="contact-button" onClick={handleContactClick}>
                {heroData?.callToAction?.primary}
              </ShimmerButton>
              
              <InteractiveHoverButton className="download-button" onClick={handleDownloadCV}>
                {heroData?.callToAction?.secondary}
              </InteractiveHoverButton>
            </div>
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
