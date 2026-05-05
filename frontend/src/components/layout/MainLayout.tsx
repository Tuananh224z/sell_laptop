import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingWidgets from './FloatingWidgets';

const MainLayout = () => {
  const { pathname } = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // 1. Scroll to top on route change
    window.scrollTo(0, 0);
    
    // 2. Show loading overlay briefly to simulate page load
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 400); // 400ms loading effect

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen relative">
      
      {/* Page Transition Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/90 z-[9999] flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
             <p className="text-primary-600 font-medium text-base animate-pulse">Đang tải trang...</p>
          </div>
        </div>
      )}

      <Header />
      
      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
      <FloatingWidgets />
    </div>
  );
};

export default MainLayout;
