import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  //const [isRTL, setIsRTL] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isRTL } = useLanguage();
  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
//    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    
    // if (savedLanguage === 'ar') {
    //   setIsRTL(true);
    //   document.documentElement.setAttribute('dir', 'rtl');
    // }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // const toggleRTL = () => {
  //   const newRTL = !isRTL;
  //   setIsRTL(newRTL);
    
  //   if (newRTL) {
  //     document.documentElement.setAttribute('dir', 'rtl');
  //     localStorage.setItem('language', 'ar');
  //   } else {
  //     document.documentElement.setAttribute('dir', 'ltr');
  //     localStorage.setItem('language', 'en');
  //   }
  // };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "overflow-auto  h-screen  transition-all duration-300",
          isSidebarOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full"
              : "-translate-x-full",
          "lg:translate-x-0 fixed lg:relative z-50 h-full",
          isRTL && "right-0",
        )}
      >
        <Sidebar
        // isRTL={isRTL}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          //   isRTL={isRTL}
          //  onToggleRTL={toggleRTL}
          onToggleTheme={toggleTheme}
          isDark={isDark}
          onToggleSidebar={toggleSidebar}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
