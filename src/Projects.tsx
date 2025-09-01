import React, { useState, useEffect } from 'react';
import ProjectGrid from './components/ProjectGrid';
import projectsData from '@/data/projects.json';
import './Projects.css';

interface Project {
  id: string;
  name: string;
  description: string;
  href: string;
  cta: string;
  imagePath: string;
}

const Projects: React.FC = () => {
  const projects: Project[] = projectsData.projects;
  
  // Screen size state management similar to About and Hero components
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

  return (
    <section className="projects-container">
      {/* Projects Title Section - 20% width on desktop */}
      <div className="projects-title-section">
        <div className="projects-title-content">
          <h2 className="projects-title">
            Projects
          </h2>
          <p className="projects-subtitle">
            A collection of projects showcasing my expertise in full-stack development, 
            machine learning, and mobile app development.
          </p>
        </div>
      </div>

      {/* Projects Grid Section - 80% width on desktop */}
      <div className="projects-grid-section">
        <ProjectGrid projects={projects} screenSize={screenSize} />
      </div>
    </section>
  );
};

export default Projects;
