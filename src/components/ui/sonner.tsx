"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ theme: propTheme, ...props }: ToasterProps) => {
  const { theme: contextTheme } = useTheme();
  const resolvedTheme = (propTheme ?? contextTheme ?? "system") as "light" | "dark" | "system";

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
