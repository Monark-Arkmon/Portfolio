import React, { useState } from 'react';
import './ExperienceBox.css';

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

interface ExperienceBoxProps {
  experience: Experience;
  index: number;
}

const ExperienceBox: React.FC<ExperienceBoxProps> = ({ experience, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Collect all description points
  const descriptions = [
    experience.description1,
    experience.description2,
    experience.description3,
    experience.description4,
  ].filter(Boolean); // Remove undefined/empty descriptions

  const handleCardClick = () => {
    if (experience.link) {
      window.open(experience.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`experience-card ${isHovered ? 'experience-card-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      style={{ 
        cursor: experience.link ? 'pointer' : 'default',
        animationDelay: `${index * 0.1}s` 
      }}
    >
      {/* Card Background Effect */}
      <div className="experience-card-bg" />
      
      {/* Card Content */}
      <div className="experience-card-content">
        {/* Header Section */}
        <div className="experience-header">
          <div className="experience-period">{experience.period}</div>
          <h3 className="experience-position">
            {experience.position}
            {experience.link && (
              <svg 
                className={`experience-arrow ${isHovered ? 'experience-arrow-hovered' : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 12 12" 
                fill="none"
              >
                <path 
                  d="M3.5 8.5L8.5 3.5M8.5 3.5H5M8.5 3.5V7" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </h3>
          <div className="experience-company">{experience.company}</div>
        </div>

        {/* Description Section */}
        <div className="experience-descriptions">
          {descriptions.map((description, descIndex) => (
            <div key={descIndex} className="experience-description-item">
              <span className="experience-bullet">•</span>
              <span className="experience-description-text">{description}</span>
            </div>
          ))}
        </div>

        {/* Technologies Section */}
        {experience.technologies && experience.technologies.length > 0 && (
          <div className="experience-technologies">
            {experience.technologies.map((tech, techIndex) => (
              <span key={techIndex} className="experience-tech-tag">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceBox;
