import { useState, useEffect } from 'react';

export function useBreakpoint(width = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= width);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= width);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  return isMobile;
}
