import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SwipeableRoutesProps {
  children: React.ReactNode;
}

const pageOrder = [
  '/',
  '/expenses',
  '/income',
  '/calendar',
  '/reports',
  '/goals',
  '/settings',
];

const SwipeableRoutes: React.FC<SwipeableRoutesProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const startX = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    console.log('handleTouchEnd triggered');
    console.log('isMobile:', isMobile);
    console.log('Current Path:', location.pathname);

    if (!isMobile) {
      console.log('Not a mobile device, returning.');
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const diffX = startX.current - endX;
    const threshold = 50; // Minimum swipe distance

    console.log('startX:', startX.current, 'endX:', endX, 'diffX:', diffX);

    const currentIndex = pageOrder.indexOf(location.pathname);
    console.log('currentIndex:', currentIndex);

    if (diffX > threshold) {
      // Swiped left (next page)
      if (currentIndex < pageOrder.length - 1) {
        const nextPage = pageOrder[currentIndex + 1];
        console.log('Swiped left, navigating to:', nextPage);
        navigate(nextPage);
      }
    } else if (diffX < -threshold) {
      // Swiped right (previous page)
      if (currentIndex > 0) {
        const prevPage = pageOrder[currentIndex - 1];
        console.log('Swiped right, navigating to:', prevPage);
        navigate(prevPage);
      }
    }
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }} // Allow vertical scrolling
    >
      {children}
    </div>
  );
};

export default SwipeableRoutes;
