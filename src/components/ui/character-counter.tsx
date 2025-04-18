import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  count: number;
  min: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ count, min, max, className }: CharacterCounterProps) {
  const isValid = count >= min && count <= max;
  const isUnderMin = count < min;
  const isOverMax = count > max;

  return (
    <div className={cn("text-sm mt-2 flex items-center justify-end space-x-2", className)}>
      <span
        className={cn(
          "font-medium",
          isValid && "text-muted-foreground",
          isUnderMin && "text-yellow-500",
          isOverMax && "text-destructive"
        )}
      >
        {count}
      </span>
      <span className="text-muted-foreground">
        / {min}-{max} znaków
      </span>
    </div>
  );
}
