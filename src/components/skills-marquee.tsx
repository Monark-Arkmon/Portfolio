import React, { useState } from 'react';
import { cn } from "../lib/utils";
import { useJsonAsset, useTextureAssetsFromPaths } from "../utils/useAssets";
import './skills-marquee.css';

interface Skill {
  name: string;
  icon: string; // Path to the image file
}

interface SkillsMarqueeProps {
  className?: string;
  pauseOnHover?: boolean;
}

interface SkillCardProps {
  skill: Skill;
  resolvedImageUrl: string;
  onHover: (skill: Skill | null, event?: React.MouseEvent) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, resolvedImageUrl, onHover }) => {
  return (
    <div 
      className="skill-card"
      data-tooltip={skill.name}
      title={skill.name}
      onMouseEnter={(e) => onHover(skill, e)}
      onMouseLeave={() => onHover(null)}
    >
      <img 
        src={resolvedImageUrl} 
        alt={skill.name}
        className="skill-logo"
      />
    </div>
  );
};

interface MarqueeRowProps {
  skills: Skill[];
  resolvedImageUrls: string[];
  reverse?: boolean;
  duration?: string;
  pauseOnHover?: boolean;
  onHover: (skill: Skill | null, event?: React.MouseEvent) => void;
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ 
  skills, 
  resolvedImageUrls,
  reverse = false, 
  duration = "40s",
  pauseOnHover = false,
  onHover
}) => {
  return (
    <div
      className="marquee-row"
      style={{ "--duration": duration } as React.CSSProperties}
    >
      <div
        className={cn(
          "marquee-content",
          { "reverse": reverse }
        )}
      >
        {/* First set */}
        {skills.map((skill, index) => (
          <SkillCard 
            key={`${skill.name}-1-${index}`} 
            skill={skill}
            resolvedImageUrl={resolvedImageUrls[index] || ''}
            onHover={onHover}
          />
        ))}
        {/* Second set for seamless loop */}
        {skills.map((skill, index) => (
          <SkillCard 
            key={`${skill.name}-2-${index}`} 
            skill={skill}
            resolvedImageUrl={resolvedImageUrls[index] || ''}
            onHover={onHover}
          />
        ))}
        {/* Third set to ensure full coverage */}
        {skills.map((skill, index) => (
          <SkillCard 
            key={`${skill.name}-3-${index}`} 
            skill={skill}
            resolvedImageUrl={resolvedImageUrls[index] || ''}
            onHover={onHover}
          />
        ))}
      </div>
    </div>
  );
};

export const SkillsMarquee: React.FC<SkillsMarqueeProps> = ({
  className,
  pauseOnHover = true
}) => {
  // Tooltip state for both rows
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number} | null>(null);

  const handleHover = (skill: Skill | null, event?: React.MouseEvent) => {
    setHoveredSkill(skill);
    if (skill && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 15
      });
    } else {
      setTooltipPosition(null);
    }
  };

  // Load skills data from JSON
  const { data: skillsData, loading: skillsLoading } = useJsonAsset('skills.json');

  // Create arrays of all image paths for loading
  const allImagePaths = skillsData ? [
    ...skillsData.skills.row1.map((skill: Skill) => skill.icon),
    ...skillsData.skills.row2.map((skill: Skill) => skill.icon)
  ] : null;

  // Load all image URLs using the asset manager
  const { data: resolvedImageUrls, loading: imagesLoading } = useTextureAssetsFromPaths(allImagePaths);

  if (skillsLoading || imagesLoading || !skillsData || !resolvedImageUrls) {
    return <div>Loading skills...</div>;
  }

  const { row1, row2 } = skillsData.skills;
  
  // Split the resolved URLs back into row1 and row2
  const row1ImageUrls = resolvedImageUrls.slice(0, row1.length);
  const row2ImageUrls = resolvedImageUrls.slice(row1.length);

  return (
    <div className={cn("skills-marquee-container", className)}>
      <div className="skills-marquee-wrapper">
        {/* Row 1 - Normal direction */}
        <MarqueeRow 
          skills={row1} 
          resolvedImageUrls={row1ImageUrls}
          duration="25s"
          pauseOnHover={pauseOnHover}
          onHover={handleHover}
        />
        
        {/* Row 2 - Reverse direction */}
        <MarqueeRow 
          skills={row2}
          resolvedImageUrls={row2ImageUrls}
          reverse={true}
          duration="30s"
          pauseOnHover={pauseOnHover}
          onHover={handleHover}
        />
      </div>
      
      {/* Global tooltip rendered outside all containers */}
      {hoveredSkill && tooltipPosition && (
        <div 
          className="skill-tooltip-floating"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 99999,
            pointerEvents: 'none'
          }}
        >
          {hoveredSkill.name}
        </div>
      )}
    </div>
  );
};

export default SkillsMarquee;
