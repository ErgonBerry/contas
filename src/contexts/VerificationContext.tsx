import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

const VERIFICATION_COOKIE_NAME = import.meta.env.VITE_VERIFICATION_COOKIE_NAME || 'user_verified';
const VERIFICATION_TIMEOUT = Number(import.meta.env.VITE_VERIFICATION_TIMEOUT_MS) || 15 * 60 * 1000; // Default to 15 minutes if not set

interface VerificationContextType {
  isVerified: boolean;
  verify: (code: string) => boolean;
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
  checkVerification: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};

interface VerificationProviderProps {
  children: ReactNode;
}

export const VerificationProvider: React.FC<VerificationProviderProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const checkVerification = () => {
    const lastVerification = Cookies.get(VERIFICATION_COOKIE_NAME);
    if (lastVerification) {
      const lastVerificationTime = new Date(lastVerification).getTime();
      if (new Date().getTime() - lastVerificationTime < VERIFICATION_TIMEOUT) {
        setIsVerified(true);
      } else {
        setIsVerified(false);
        setShowVerificationModal(true);
      }
    } else {
      setIsVerified(false);
      setShowVerificationModal(true);
    }
  };

  useEffect(() => {
    checkVerification();
    const interval = setInterval(checkVerification, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const verify = (code: string) => {
    const correctPin = import.meta.env.VITE_PIN_CODE;
    if (code === correctPin) {
      Cookies.set(VERIFICATION_COOKIE_NAME, new Date().toISOString(), { expires: 1 }); // Expires in 1 day
      setIsVerified(true);
      setShowVerificationModal(false);
      return true;
    } else {
      return false;
    }
  };

  return (
    <VerificationContext.Provider value={{ isVerified, verify, showVerificationModal, setShowVerificationModal, checkVerification }}>
      {children}
    </VerificationContext.Provider>
  );
};