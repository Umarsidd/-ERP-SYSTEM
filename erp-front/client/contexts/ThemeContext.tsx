import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  destructive: string;
  success: string;
  warning: string;
  info: string;
}

interface LogoSettings {
  logoUrl: string;
  logoText: string;
  showText: boolean;
  logoSize: 'small' | 'medium' | 'large';
}

interface ThemeContextType {
  colors: ThemeColors;
  logo: LogoSettings;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  updateLogo: (newLogo: Partial<LogoSettings>) => void;
  resetToDefault: () => void;
  applyPreset: (preset: string) => void;
}

const defaultColors: ThemeColors = {
  primary: 'hsl(184, 32%, 37%)',
  secondary: 'hsl(167, 65%, 51%)',
  accent: 'hsl(210, 40%, 96.1%)',
  background: 'hsl(0, 0%, 100%)',
  foreground: 'hsl(222.2, 84%, 4.9%)',
  muted: 'hsl(210, 40%, 96.1%)',
  border: 'hsl( 214.3 31.8% 91.4%)',
  destructive: 'hsl(0, 84.2%, 60.2%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(199, 89%, 48%)'
};

const defaultLogo: LogoSettings = {
  logoUrl: '/placeholder.svg',
  logoText: 'ERP System',
  showText: true,
  logoSize: 'medium'
};

const colorPresets = {
  default: defaultColors,
  blue: {
    ...defaultColors,
    primary: 'hsl(214, 95%, 53%)',
    accent: 'hsl(214, 95%, 93%)'
  },
  green: {
    ...defaultColors,
    primary: 'hsl(142, 76%, 36%)',
    accent: 'hsl(142, 76%, 86%)'
  },
  purple: {
    ...defaultColors,
    primary: 'hsl(263, 70%, 50%)',
    accent: 'hsl(263, 70%, 90%)'
  },
  orange: {
    ...defaultColors,
    primary: 'hsl(25, 95%, 53%)',
    accent: 'hsl(25, 95%, 93%)'
  },
  red: {
    ...defaultColors,
    primary: 'hsl(0, 84%, 60%)',
    accent: 'hsl(0, 84%, 95%)'
  },
  dark: {
  primary: 'hsl(184, 32%, 37%)',
  secondary: 'hsl(167, 65%, 51%)',
  accent: 'hsl(210, 40%, 96.1%)',
    background: 'hsl(222.2, 84%, 4.9%)',
    foreground: 'hsl(210, 40%, 98%)',
    muted: 'hsl(217.2, 32.6%, 17.5%)',
    border: 'hsl(217.2 32.6% 17.5%)',
    destructive: 'hsl(0, 62.8%, 30.6%)',
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    info: 'hsl(199, 89%, 48%)'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem('theme-colors');
    return saved ? JSON.parse(saved) : defaultColors;
  });

  const [logo, setLogo] = useState<LogoSettings>(() => {
    const saved = localStorage.getItem('logo-settings');
    return saved ? JSON.parse(saved) : defaultLogo;
  });

  const updateColors = (newColors: Partial<ThemeColors>) => {
    const updatedColors = { ...colors, ...newColors };
    setColors(updatedColors);
    localStorage.setItem('theme-colors', JSON.stringify(updatedColors));
  };

  const updateLogo = (newLogo: Partial<LogoSettings>) => {
    const updatedLogo = { ...logo, ...newLogo };
    setLogo(updatedLogo);
    localStorage.setItem('logo-settings', JSON.stringify(updatedLogo));
  };

  const resetToDefault = () => {
    setColors(defaultColors);
    setLogo(defaultLogo);
    localStorage.removeItem('theme-colors');
    localStorage.removeItem('logo-settings');
  };

  const applyPreset = (preset: string) => {
    const presetColors = colorPresets[preset as keyof typeof colorPresets];
    if (presetColors) {
      updateColors(presetColors);
    }
  };

  // Apply colors to CSS custom properties
  // useEffect(() => {
  //   const root = document.documentElement;
    
  //   // Convert HSL to individual values for CSS
  //   const hslToValues = (hsl: string) => {
  //     const match = hsl.match(/hsl\(([^)]+)\)/);
  //     return match ? match[1] : '0, 0%, 0%';
  //   };

  //   root.style.setProperty('--primary', hslToValues(colors.primary));
  //   root.style.setProperty('--secondary', hslToValues(colors.secondary));
  //   root.style.setProperty('--accent', hslToValues(colors.accent));
  //   root.style.setProperty('--background', hslToValues(colors.background));
  //   root.style.setProperty('--foreground', hslToValues(colors.foreground));
  //   root.style.setProperty('--muted', hslToValues(colors.muted));
  //   root.style.setProperty('--border', hslToValues(colors.border));
  //   root.style.setProperty('--destructive', hslToValues(colors.destructive));
  //   root.style.setProperty('--success', hslToValues(colors.success));
  //   root.style.setProperty('--warning', hslToValues(colors.warning));
  //   root.style.setProperty('--info', hslToValues(colors.info));
    
  //   // Apply primary color to additional elements
  //   root.style.setProperty('--ring', hslToValues(colors.primary));
  //   root.style.setProperty('--chart-1', hslToValues(colors.primary));
  //   root.style.setProperty('--chart-2', hslToValues(colors.success));
  //   root.style.setProperty('--chart-3', hslToValues(colors.warning));
  //   root.style.setProperty('--chart-4', hslToValues(colors.info));
  //   root.style.setProperty('--chart-5', hslToValues(colors.destructive));
  // }, [colors]);

  const value: ThemeContextType = {
    colors,
    logo,
    updateColors,
    updateLogo,
    resetToDefault,
    applyPreset
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { colorPresets };
