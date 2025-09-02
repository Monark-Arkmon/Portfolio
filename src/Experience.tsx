import React from 'react';
import ExperienceBox from './components/ExperienceBox';
import { useJsonAsset } from './utils/useAssets';
import './Experience.css';

interface Experience {
  id: string;
  period: string;
  position: string;
  company: string;
  description1: string;
  description2?: string;
  description3?: string;
  description4?: string;
  technologies: string[];
  link: string;
}

interface ExperienceData {
  experiences: Experience[];
}

const Experience: React.FC = () => {
  // Load experience data from Cloudflare R2
  const { data: experienceData, loading: experienceLoading, error: experienceError } = useJsonAsset<ExperienceData>('experience.json');

  // Calculate dynamic height based on number of experiences and content
  const calculateSectionHeight = () => {
    if (!experienceData?.experiences) return '100vh';
    
    const screenWidth = window.innerWidth;
    const experiences = experienceData.experiences;
    
    // Different calculations based on screen size
    if (screenWidth <= 1024) {
      // Mobile/tablet: column layout, height is auto-calculated by CSS
      return 'auto';
    }
    
    // Desktop: side-by-side layout, need to calculate height
    let totalHeight = 0;
    
    // Base padding for cards section
    const sectionPadding = 160; // top + bottom padding
    
    // Calculate height for each card based on its content
    experiences.forEach((experience, index) => {
      let cardHeight = 100; // Base card padding and spacing
      
      // Header height (period + position + company)
      cardHeight += 120;
      
      // Description lines
      const descriptions = [
        experience.description1,
        experience.description2,
        experience.description3,
        experience.description4,
      ].filter(Boolean);
      
      // Each description line is roughly 24px with line-height
      cardHeight += descriptions.length * 28;
      
      // Technology tags (estimated based on number of tags)
      if (experience.technologies && experience.technologies.length > 0) {
        const tagRows = Math.ceil(experience.technologies.length / 6); // Roughly 6 tags per row
        cardHeight += tagRows * 32;
      }
      
      totalHeight += cardHeight;
      
      // Add gap between cards (except for last card)
      if (index < experiences.length - 1) {
        totalHeight += 32;
      }
    });
    
    // Add section padding
    totalHeight += sectionPadding;
    
    // Ensure minimum height of viewport
    const minHeight = window.innerHeight;
    
    // Add some extra buffer for safety
    const bufferHeight = 20;
    
    return `${Math.max(totalHeight + bufferHeight, minHeight)}px`;
  };

  return (
    <section className="experience-container" style={{ height: calculateSectionHeight() }}>
      {/* Experience Cards Section - 80% width on desktop */}
      <div className="experience-cards-section">
        {experienceLoading && (
          <div className="experience-loading">Loading experiences...</div>
        )}
        {experienceError && (
          <div className="experience-error">
            Error loading experiences: {experienceError.message}
          </div>
        )}
        {experienceData && (
          <div className="experience-cards-container">
            {experienceData.experiences.map((experience, index) => (
              <ExperienceBox 
                key={experience.id} 
                experience={experience} 
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Experience Title Section - 20% width on desktop */}
      <div className="experience-title-section">
        <div className="experience-title-content">
          <h2 className="experience-title">
            Experience
          </h2>
          <p className="experience-subtitle">
            Professional journey and key contributions in software development and leadership roles.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Experience;
