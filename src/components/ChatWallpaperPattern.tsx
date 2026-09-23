import React from 'react';
import { ChatPattern } from '../types';

interface ChatWallpaperPatternProps {
  pattern: ChatPattern;
  opacity?: number;
  isDark?: boolean;
  color?: string;
  className?: string;
}

export const ChatWallpaperPattern: React.FC<ChatWallpaperPatternProps> = ({
  pattern,
  opacity = 0.08,
  isDark = false,
  color,
  className = '',
}) => {
  if (pattern === 'none') return null;

  const strokeColor = color || (isDark ? '#ffffff' : '#000000');

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-300 z-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {pattern === 'telegram-doodle' && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="telegram-doodle-pat"
              width="180"
              height="180"
              patternUnits="userSpaceOnUse"
            >
              {/* Paper Plane */}
              <path
                d="M 20,25 L 55,40 L 35,50 L 30,68 L 42,54 L 55,40 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Heart */}
              <path
                d="M 115,25 C 110,18 100,18 95,25 C 90,18 80,18 75,25 C 70,35 85,50 95,58 C 105,50 120,35 115,25 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              {/* Chat Bubble */}
              <rect
                x="135"
                y="35"
                width="28"
                height="20"
                rx="6"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              <path
                d="M 142,55 L 138,62 L 148,55"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Cloud */}
              <path
                d="M 25,115 C 20,115 15,110 17,105 C 15,98 22,93 28,95 C 32,88 42,88 46,94 C 52,94 56,98 55,105 C 58,110 54,115 48,115 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              {/* Smiley Face */}
              <circle
                cx="100"
                cy="105"
                r="13"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              <circle cx="96" cy="102" r="1.5" fill={strokeColor} />
              <circle cx="104" cy="102" r="1.5" fill={strokeColor} />
              <path
                d="M 95,109 C 97,113 103,113 105,109"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              {/* Lightning */}
              <path
                d="M 150,95 L 142,108 L 148,108 L 140,122 L 154,106 L 148,106 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* Coffee Cup */}
              <path
                d="M 30,150 L 50,150 C 50,162 42,168 30,168 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.4"
              />
              <path
                d="M 48,154 C 54,154 54,162 48,162"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.4"
              />
              {/* Star */}
              <path
                d="M 90,145 L 93,153 L 102,154 L 95,160 L 97,169 L 90,164 L 83,169 L 85,160 L 78,154 L 87,153 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* Padlock */}
              <rect
                x="135"
                y="148"
                width="20"
                height="16"
                rx="3"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              <path
                d="M 140,148 L 140,142 C 140,137 150,137 150,142 L 150,148"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#telegram-doodle-pat)" />
        </svg>
      )}

      {pattern === 'dots' && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dots-pattern"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1.5" fill={strokeColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-pattern)" />
        </svg>
      )}

      {pattern === 'geometric-cubes' && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="cubes-pattern"
              width="48"
              height="84"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M24,0 L48,14 L48,42 L24,28 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.2"
              />
              <path
                d="M0,14 L24,0 L24,28 L0,42 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.2"
              />
              <path
                d="M0,42 L24,28 L48,42 L24,56 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.2"
              />
              <path
                d="M24,56 L48,70 L48,98 L24,84 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.2"
              />
              <path
                d="M0,70 L24,56 L24,84 L0,98 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cubes-pattern)" />
        </svg>
      )}

      {pattern === 'mesh-aura' && (
        <div className="w-full h-full relative">
          <div 
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl"
            style={{ backgroundColor: color || '#007AFF' }}
          />
          <div 
            className="absolute top-1/2 -left-12 w-56 h-56 rounded-full blur-3xl opacity-70"
            style={{ backgroundColor: isDark ? '#5856D6' : '#34C759' }}
          />
          <div 
            className="absolute -bottom-10 right-1/4 w-44 h-44 rounded-full blur-3xl opacity-60"
            style={{ backgroundColor: color || '#007AFF' }}
          />
        </div>
      )}

      {pattern === 'circuit' && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="circuit-pat"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M10,10 L30,10 L45,25 L65,25 M45,25 L45,55 L60,70 L75,70"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M25,75 L25,45 L10,30 M45,55 L30,70"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="10" cy="10" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.2" />
              <circle cx="65" cy="25" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.2" />
              <circle cx="75" cy="70" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.2" />
              <circle cx="25" cy="75" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.2" />
              <circle cx="10" cy="30" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-pat)" />
        </svg>
      )}

      {pattern === 'blueprint' && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="blueprint-pat"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <rect width="40" height="40" fill="none" stroke={strokeColor} strokeWidth="0.8" />
              <path d="M 0,20 L 40,20 M 20,0 L 20,40" stroke={strokeColor} strokeWidth="0.4" strokeDasharray="2,2" />
              <circle cx="20" cy="20" r="1.5" fill={strokeColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-pat)" />
        </svg>
      )}

      {pattern === 'topography' && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="topography-pat"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M10,20 C30,5 70,5 90,25 C110,45 105,75 85,95 C65,115 35,105 20,85 C5,65 -10,35 10,20 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1"
              />
              <path
                d="M25,35 C40,20 60,20 75,35 C90,50 85,70 70,85 C55,100 35,90 25,75 C15,60 10,50 25,35 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1"
              />
              <path
                d="M40,48 C50,38 60,40 65,50 C70,60 65,70 55,75 C45,80 35,75 35,65 C35,55 30,58 40,48 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topography-pat)" />
        </svg>
      )}

      {pattern === 'stars-constellation' && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="stars-pat"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1.5" fill={strokeColor} />
              <circle cx="50" cy="35" r="2" fill={strokeColor} />
              <circle cx="80" cy="15" r="1.2" fill={strokeColor} />
              <circle cx="35" cy="70" r="1.8" fill={strokeColor} />
              <circle cx="70" cy="80" r="2.2" fill={strokeColor} />
              <circle cx="90" cy="60" r="1.2" fill={strokeColor} />
              
              {/* Constellation lines */}
              <line x1="20" y1="20" x2="50" y2="35" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2,3" />
              <line x1="50" y1="35" x2="80" y2="15" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2,3" />
              <line x1="35" y1="70" x2="70" y2="80" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2,3" />
              <line x1="70" y1="80" x2="90" y2="60" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2,3" />

              {/* Little 4-point sparkle */}
              <path d="M 50,70 L 52,74 L 56,76 L 52,78 L 50,82 L 48,78 L 44,76 L 48,74 Z" fill={strokeColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars-pat)" />
        </svg>
      )}

      {pattern === 'moroccan-arabesque' && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="arabesque-pat"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30,0 C 20,15 10,25 0,30 C 10,35 20,45 30,60 C 40,45 50,35 60,30 C 50,25 40,15 30,0 Z"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.1"
              />
              <path
                d="M 0,0 C 10,10 20,20 30,30 C 20,40 10,50 0,60 M 60,0 C 50,10 40,20 30,30 C 40,40 50,50 60,60"
                fill="none"
                stroke={strokeColor}
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
              <circle cx="30" cy="30" r="3" fill="none" stroke={strokeColor} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arabesque-pat)" />
        </svg>
      )}
    </div>
  );
};
