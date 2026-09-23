import { WallpaperPattern } from '../types';

/**
 * Returns inline SVG background URL or SVG background style for chat wallpaper
 */
export const getWallpaperSvg = (
  pattern: WallpaperPattern = 'none',
  isDark: boolean = false,
  opacity: number = 0.08
): string | null => {
  if (pattern === 'none') return null;

  const strokeColor = isDark ? '%23ffffff' : '%23000000';
  const fillColor = isDark ? '%23ffffff' : '%23000000';

  switch (pattern) {
    case 'telegram-doodle': {
      // Telegram doodle shapes (paper airplane, chat bubbles, note, coffee, hearts, sparkles)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="${strokeColor}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}">
        <!-- Paper Plane -->
        <path d="M22 28L42 36L30 46L22 28Z" />
        <path d="M42 36L28 39" />
        <!-- Chat Bubble -->
        <path d="M110 25C110 20 120 20 125 25C130 30 125 35 120 35L115 40V35H110Z" />
        <!-- Heart -->
        <path d="M72 82C70 79 66 79 64 82C62 85 66 90 68 92L72 96L76 92C78 90 82 85 80 82C78 79 74 79 72 82Z" />
        <!-- Coffee Cup -->
        <path d="M120 120H136V132C136 135 133 138 130 138H126C123 138 120 135 120 132V120Z" />
        <path d="M136 123H140C142 123 143 125 143 127C143 129 142 131 140 131H136" />
        <!-- Sparkle / Star -->
        <path d="M35 120L36.5 125L42 126.5L36.5 128L35 133L33.5 128L28 126.5L33.5 125Z" />
        <path d="M135 70L136 73L139 74L136 75L135 78L134 75L131 74L134 73Z" />
        <!-- Smile Note -->
        <rect x="75" y="22" width="16" height="16" rx="3" />
        <circle cx="79.5" cy="27.5" r="0.75" fill="${fillColor}" />
        <circle cx="86.5" cy="27.5" r="0.75" fill="${fillColor}" />
        <path d="M79 32C81 34 85 34 87 32" />
        <!-- Audio waves -->
        <path d="M25 75V85M21 78V82M29 77V83M33 79V81" />
        <!-- Notification bell -->
        <path d="M88 135C88 132 89 128 93 128C97 128 98 132 98 135H88Z" />
        <path d="M92 137C92 138 94 138 94 137" />
      </svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    case 'subtle-dots': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="1.5" fill="${fillColor}" opacity="${opacity}" />
      </svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    case 'geometric-mesh': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="${strokeColor}" stroke-width="0.8" opacity="${opacity}">
        <path d="M0 20L20 0L40 20L20 40Z" />
        <path d="M20 20L40 0" />
        <path d="M0 0L20 20" />
        <path d="M20 20L0 40" />
        <path d="M20 20L40 40" />
      </svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    case 'topography': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="${strokeColor}" stroke-width="0.8" stroke-linecap="round" opacity="${opacity}">
        <path d="M0 20C30 10 70 30 100 20" />
        <path d="M0 40C20 35 45 45 70 40C85 37 95 42 100 45" />
        <path d="M0 65C35 55 60 75 100 60" />
        <path d="M0 85C40 90 70 75 100 85" />
        <path d="M30 0C35 25 25 50 30 75C32 85 30 95 30 100" />
        <path d="M70 0C65 30 75 60 70 100" />
      </svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    case 'blueprint': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="${strokeColor}" stroke-width="0.75" opacity="${opacity}">
        <rect width="30" height="30" />
        <path d="M15 0V30M0 15H30" stroke-dasharray="2,2" />
      </svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    case 'stars': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="${strokeColor}" stroke-width="0.8" opacity="${opacity}">
        <path d="M15 15L16 18L19 19L16 20L15 23L14 20L11 19L14 18Z" fill="${fillColor}" />
        <circle cx="55" cy="25" r="1.2" fill="${fillColor}" />
        <circle cx="25" cy="60" r="1.5" fill="${fillColor}" />
        <path d="M60 55L61 57L63 58L61 59L60 61L59 59L57 58L59 57Z" fill="${fillColor}" />
        <circle cx="70" cy="70" r="0.8" fill="${fillColor}" />
      </svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    case 'circuit': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="${opacity}">
        <path d="M10 10H30V30H50" />
        <circle cx="10" cy="10" r="2.5" fill="${fillColor}" />
        <circle cx="50" cy="30" r="2.5" fill="${fillColor}" />
        <path d="M10 50H30V40H50V50" />
        <circle cx="10" cy="50" r="2.5" fill="${fillColor}" />
        <circle cx="50" cy="50" r="2.5" fill="${fillColor}" />
      </svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    default:
      return null;
  }
};
