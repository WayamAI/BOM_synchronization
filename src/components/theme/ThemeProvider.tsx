import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider attribute={["class", "data-theme"]} defaultTheme="light" enableSystem={false} disableTransitionOnChange>
    {children}
  </NextThemesProvider>
);
