"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

/*
This is a basic ThemeProvider using next-themes.
You might need to install it:
npm install next-themes

And add it to your package.json dependencies.

For full Shadcn UI integration, you would typically also have a `useTheme` hook
and potentially a button to toggle themes.
*/