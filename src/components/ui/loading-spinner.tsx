import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

export function LoadingSpinner({ className, size = "default", ...props }: LoadingSpinnerProps) {
  return (
    <div role="status" className={cn("flex justify-center items-center", className)} {...props}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      <span className="sr-only">Ładowanie...</span>
    </div>
  );
}
