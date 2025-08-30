import React, { useState, useEffect, useCallback } from 'react';
import {
  type HTMLMotionProps,
  motion,
  type SpringOptions,
  type Transition,
  useMotionValue,
  useSpring,
} from 'motion/react';
import './StarsBackground.css';

type StarLayerProps = HTMLMotionProps<'div'> & {
  count: number;
  size: number;
  transition: Transition;
  starColor: string;
  className?: string;
};

function generateStars(count: number, starColor: string) {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * (window.innerHeight * 3));
    shadows.push(`${x}px ${y}px ${starColor}`);
  }
  return shadows.join(', ');
}

function StarLayer({
  count = 1000,
  size = 1,
  transition = { repeat: Infinity, duration: 50, ease: 'linear' },
  starColor = '#fff',
  className = '',
  ...props
}: StarLayerProps) {
  const [boxShadow, setBoxShadow] = useState<string>('');

  useEffect(() => {
    setBoxShadow(generateStars(count, starColor));
  }, [count, starColor]);

  return (
    <motion.div
      data-slot="star-layer"
      animate={{ y: [0, -window.innerHeight * 2] }}
      transition={transition}
      className={`star-layer ${className}`}
      {...props}
    >
      <div
        className="star-dot"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: boxShadow,
        }}
      />
      <div
        className="star-dot star-dot-duplicate"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: boxShadow,
        }}
      />
    </motion.div>
  );
}

type StarsBackgroundProps = React.ComponentProps<'div'> & {
  factor?: number;
  speed?: number;
  transition?: SpringOptions;
  starColor?: string;
  pointerEvents?: boolean;
  children?: React.ReactNode;
};

function StarsBackground({
  children,
  className = '',
  factor = 0.05,
  speed = 50,
  transition = { stiffness: 50, damping: 20 },
  starColor = '#fff',
  pointerEvents = true,
  ...props
}: StarsBackgroundProps) {
  const offsetX = useMotionValue(1);
  const offsetY = useMotionValue(1);

  const springX = useSpring(offsetX, transition);
  const springY = useSpring(offsetY, transition);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const newOffsetX = -(e.clientX - centerX) * factor;
      const newOffsetY = -(e.clientY - centerY) * factor;
      offsetX.set(newOffsetX);
      offsetY.set(newOffsetY);
    },
    [offsetX, offsetY, factor],
  );

  useEffect(() => {
    if (pointerEvents) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove, pointerEvents]);

  return (
    <>
      {/* Stars background visual layer */}
      <div
        data-slot="stars-background"
        className={`stars-background ${className}`}
        {...props}
      >
        <motion.div
          style={{ x: springX, y: springY }}
          className={pointerEvents ? '' : 'stars-no-pointer-events'}
        >
          <StarLayer
            count={1000}
            size={1}
            transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
            starColor={starColor}
          />
          <StarLayer
            count={400}
            size={2}
            transition={{
              repeat: Infinity,
              duration: speed * 2,
              ease: 'linear',
            }}
            starColor={starColor}
          />
          <StarLayer
            count={200}
            size={3}
            transition={{
              repeat: Infinity,
              duration: speed * 3,
              ease: 'linear',
            }}
            starColor={starColor}
          />
        </motion.div>
        {children}
      </div>
    </>
  );
}

export {
  StarLayer,
  StarsBackground,
  type StarLayerProps,
  type StarsBackgroundProps,
};
