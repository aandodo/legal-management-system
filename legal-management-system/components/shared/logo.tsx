import { Droplets } from "lucide-react";

import { APP_NAME, COMPANY_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  light?: boolean;
  showText?: boolean;
}

export function Logo({ className, light = false, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-md shadow-blue-600/20">
        <Droplets className="h-5 w-5" />
      </div>
      {showText && (
        <div className="leading-tight">
          <p
            className={cn(
              "text-sm font-bold uppercase tracking-wide",
              light ? "text-white" : "text-slate-900"
            )}
          >
            {APP_NAME}
          </p>
          <p
            className={cn(
              "text-[11px] font-medium",
              light ? "text-blue-100" : "text-slate-500"
            )}
          >
            {COMPANY_NAME}
          </p>
        </div>
      )}
    </div>
  );
}
