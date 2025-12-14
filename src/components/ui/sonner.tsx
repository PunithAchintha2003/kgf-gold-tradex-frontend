import { Toaster as Sonner, ToasterProps } from "sonner";
import { useApp } from "../../contexts/AppContext";

const Toaster = ({ theme: propTheme, ...props }: ToasterProps) => {
  const { theme: contextTheme } = useApp();
  const resolvedTheme = (propTheme ?? contextTheme ?? "light") as "light" | "dark";

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
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
