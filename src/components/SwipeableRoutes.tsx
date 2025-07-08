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
    if (!isMobile) return;

    const endX = e.changedTouches[0].clientX;
    const diffX = startX.current - endX;
    const threshold = 50; // Minimum swipe distance

    const currentIndex = pageOrder.indexOf(location.pathname);

    if (diffX > threshold) {
      // Swiped left (next page)
      if (currentIndex < pageOrder.length - 1) {
        navigate(pageOrder[currentIndex + 1]);
      }
    } else if (diffX < -threshold) {
      // Swiped right (previous page)
      if (currentIndex > 0) {
        navigate(pageOrder[currentIndex - 1]);
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
