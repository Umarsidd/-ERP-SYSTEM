import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  toggleRTL: (
    //lang: Language

  ) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");



const [isRTL, setIsRTL] = useState(language === "ar");

  // useEffect(() => {
  //   // Apply RTL/LTR direction to document
  //         setIsRTL(language === "ar");
  //   document.documentElement.dir = isRTL ? "rtl" : "ltr";
  //   document.documentElement.lang = language;


  //       localStorage.setItem('preferred-language', language);

      
  


  //   // Save language preference to localStorage
  //  // localStorage.setItem("preferred-language", language);
  // }, [language, isRTL]);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem(
      "preferred-language",
    ) as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguage(savedLanguage);
      setIsRTL(savedLanguage === "ar");
    document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLanguage;
    }



    
  }, []);


    const toggleRTL = () => {
      const newRTL = !isRTL;
      setIsRTL(newRTL);
      
      if (newRTL) {
              document.documentElement.lang = 'ar';
                setLanguage('ar');
        document.documentElement.setAttribute('dir', 'rtl');
        localStorage.setItem('preferred-language', 'ar');
      } else {
              document.documentElement.lang =  'en';
                setLanguage('en');
        document.documentElement.setAttribute('dir', 'ltr');
        localStorage.setItem('preferred-language', 'en');
      }
    

    };


  const value = {
    language,
    toggleRTL,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
