'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeConfig } from './settings/types';

interface ThemeContextType {
  currentTheme: ThemeConfig | null;
  setTheme: (theme: ThemeConfig) => void;
  applyTheme: (theme: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 默认暗色主题
const DEFAULT_THEME: ThemeConfig = {
  id: 'dark',
  name: '暗色调',
  type: 'dark',
  colors: {
    primary: '#f97316',
    secondary: '#64748b',
    background: '#111827',
    surface: '#1f2937',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#374151'
  },
  isDefault: true
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);

  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // 应用CSS变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // 设置主题类名
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${theme.type}`);
    
    // 保存到localStorage
    localStorage.setItem('currentTheme', theme.id);
  };

  const setTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  useEffect(() => {
    // 初始化主题
    const initTheme = async () => {
      try {
        // 尝试从API获取用户的主题配置
        const response = await fetch('/api/style-config');
        if (response.ok) {
          const data = await response.json();
          const savedThemeId = data.config.currentTheme;
          
          // 这里需要获取所有可用主题来找到对应的主题
          // 暂时使用默认主题
          const theme = DEFAULT_THEME;
          setCurrentTheme(theme);
          applyTheme(theme);
        } else {
          // 如果API调用失败，使用默认主题
          setCurrentTheme(DEFAULT_THEME);
          applyTheme(DEFAULT_THEME);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
        // 使用默认主题
        setCurrentTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
      }
    };

    initTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}