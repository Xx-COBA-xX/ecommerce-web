"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show splash screen for at least 2.5 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Remove from DOM after fade out animation (500ms)
      setTimeout(() => {
        setShow(false);
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ease-in-out",
        fadeOut ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
        <div className="relative w-80 h-80 md:w-80 md:h-80 animate-pulse">
          {mounted && (
            <Image
              src={
                resolvedTheme === "dark" ? "/dark-logo.png" : "/light-logo.png"
              }
              alt="Mawssat Al-Sibt Al-Mujtaba"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 192px, 300px"
            />
          )}
        </div>
        {/* <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-wide">
            مؤسسة السبط المجتبى
          </h1>
          <div className="h-1.5 w-32 bg-secondary/30 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-secondary w-full animate-[shimmer_1.5s_infinite_translateX(-100%)] rounded-full" />
          </div>
        </div> */}
      </div>
    </div>
  );
}
