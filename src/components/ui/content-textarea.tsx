import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ValidationMessage } from "@/components/ui/validation-message";
import { CharacterCounter } from "@/components/ui/character-counter";

interface ContentTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

export function ContentTextarea({
  value,
  onChange,
  onBlur,
  error,
  disabled
}: ContentTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="content">Treść dokumentu</Label>
      <Textarea
        id="content"
        name="content"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="Wprowadź treść dokumentu..."
        className="min-h-[300px] resize-y"
      />
      <div className="flex flex-col gap-1">
        <CharacterCounter
          count={value.length}
          min={1000}
          max={10000}
        />
        {error && <ValidationMessage message={error} />}
      </div>
    </div>
  );
} 