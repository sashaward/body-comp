"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Wraps page content and applies a subtle fade-in when the route changes.
 * Works with Link navigation (three dots, back button, etc.).
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
