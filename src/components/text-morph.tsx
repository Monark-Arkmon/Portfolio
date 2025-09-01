import React, { useCallback, useEffect, useRef } from 'react';
import './text-morph.css';

interface TextMorphProps {
  texts: string[];
  morphDelay?: number;
  className?: string;
}

const morphTime = 2.5;
const cooldownTime = 3;

const TextMorph: React.FC<TextMorphProps> = ({
  texts,
  morphDelay = 0,
  className = ''
}) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());
  const delayRef = useRef(morphDelay);
  const startedRef = useRef(false);

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;

      // Reduced blur for sharper edges
      current2.style.filter = `blur(${Math.min(4 / fraction - 4, 50)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(
        4 / invertedFraction - 4,
        50,
      )}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "blur(0px)";
      current2.style.opacity = "100%";
      current1.style.filter = "blur(0px)";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      // Handle initial delay
      if (delayRef.current > 0) {
        delayRef.current -= dt;
        // Show the first text immediately, even during delay
        if (!startedRef.current) {
          const [current1, current2] = [text1Ref.current, text2Ref.current];
          if (current1 && current2) {
            current1.textContent = texts[0] || '';
            current2.textContent = texts[1] || texts[0] || '';
            current1.style.opacity = "100%";
            current2.style.opacity = "0%";
            current1.style.filter = "blur(0px)";
            current2.style.filter = "blur(0px)";
            startedRef.current = true;
          }
        }
        return; // Don't start morphing yet
      }

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) {
        morphRef.current += dt;
        doMorph();
      } else {
        doCooldown();
      }
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown, texts]);

  return (
    <div className={`text-morph-container ${className}`}>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
      <svg
        className="fixed h-0 w-0"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="text-morph-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default TextMorph;
