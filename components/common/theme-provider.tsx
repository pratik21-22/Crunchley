'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Temporary workaround for React 19 warning: "Encountered a script tag..." 
  // next-themes renders an inline <script> to prevent theme flicker on page load.
  // The warning is a strict false positive that triggers only in development mode.
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const orig = console.error;
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering React component')) {
        return;
      }
      orig.apply(console, args);
    };
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
