import React from 'react';
import { useImageAssetFromPath } from '../utils/useAssets';
import './ProjectGrid.css';

interface Project {
  id: string;
  name: string;
  description: string;
  href: string;
  cta: string;
  imagePath: string;
}

interface ProjectGridProps {
  projects: Project[];
  screenSize: {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isLaptop: boolean;
    isDesktop: boolean;
  };
}

// Grid layout pattern
const getGridLayout = (count: number) => {
    //   A B C
    //   A D E
    //   F G E
    // A=col-span-1, B=col-span-1, C=col-span-1 row-span-2 (vertical)
    // D=col-span-1 row-span-2 (vertical), E=col-span-1, F=col-span-1
    // G=col-span-1
  
  const basePattern = [
    'col-span-1 row-span-1', // A
    'col-span-1 row-span-1', // B  
    'col-span-1 row-span-2', // C (vertical)
    'col-span-1 row-span-2', // D (vertical)
    'col-span-1 row-span-1', // E
    'col-span-1 row-span-1', // F
    'col-span-1 row-span-1', // G
  ];
  
  // If we have fewer than 7 projects, return subset
  if (count <= basePattern.length) {
    return basePattern.slice(0, count);
  }
  
  // For more than 7 projects, extend the pattern
  const extendedPattern = [...basePattern];
  const additionalCount = count - basePattern.length;
  
  // Continue the pattern for additional items
  for (let i = 0; i < additionalCount; i++) {
    const position = i % 4;
    if (position === 0 || position === 1) {
      extendedPattern.push('col-span-1 row-span-1');
    } else if (position === 2) {
      extendedPattern.push('col-span-1 row-span-2');
    } else {
      extendedPattern.push('col-span-1 row-span-1');
    }
  }
  
  return extendedPattern;
};

// ProjectImage component to handle image loading with asset manager
interface ProjectImageProps {
  imagePath: string;
  projectName: string;
}

const ProjectImage: React.FC<ProjectImageProps> = ({ imagePath, projectName }) => {
  const { data: imageUrl, loading, error } = useImageAssetFromPath(imagePath);

  if (loading || error || !imageUrl) {
    return null;
  }

  return (
    <div className="project-image-container">
      <img 
        src={imageUrl}
        alt={projectName}
        className="project-image"
        loading="lazy"
      />
    </div>
  );
};

// ProjectCard component
interface ProjectCardProps {
  project: Project;
  className: string;
  background: React.ReactNode;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className, background }) => {
  // Combine class names manually
  const cardClasses = `group project-card ${className}`;

  return (
    <div className={cardClasses}>
      {/* Background */}
      <div className="absolute inset-0">
        {background}
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col">
        
        {/* Image Area - Now contains project images with fade mask */}
        <div className="flex-1 relative project-image-area">
          <ProjectImage 
            imagePath={project.imagePath}
            projectName={project.name}
          />
        </div>

        {/* Bottom Info Container - Expandable */}
        <div className="project-info-container">
          
          {/* Title - Always visible */}
          <div className="project-title-container">
            <h3 className="project-title">
              {project.name}
            </h3>
          </div>

          {/* Description and Button - Only on hover */}
          <div className="project-expanded-content">
            <div className="project-content">
              <p className="project-description">
                {project.description}
              </p>
              
              {/* Custom Button */}
              <div className="project-button-container">
                <a 
                  href={project.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-button"
                >
                  <span>{project.cta}</span>
                  <svg className="project-button-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path 
                      d="M3.5 8.5L8.5 3.5M8.5 3.5H5M8.5 3.5V7" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Hover overlay for better contrast */}
        <div className="project-hover-overlay" />
      </div>
    </div>
  );
};

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, screenSize }) => {
  const gridLayout = getGridLayout(projects.length);

  return (
    <div className="project-grid-container">
      <div className="project-grid">
        {projects.map((project, index) => {
          // Only use simple layout for mobile (480px and below)
          // Preserve bento layout for tablets and desktop
          const colSpanClass = (screenSize.width <= 480) ? 'col-span-1' : (gridLayout[index] || 'col-span-1');
          
          return (
            <ProjectCard
              key={project.id}
              project={project}
              className={`${colSpanClass}`}
              background={
                <div className="project-card-background">
                  {/* Clean minimal background */}
                  <div className="background-overlay" />
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProjectGrid;
