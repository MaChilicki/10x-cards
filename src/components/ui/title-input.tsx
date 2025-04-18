import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationMessage } from "@/components/ui/validation-message";

interface TitleInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

export function TitleInput({ value, onChange, onBlur, error, disabled }: TitleInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Tytuł dokumentu</Label>
      <Input
        type="text"
        id="name"
        name="name"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="Wprowadź tytuł dokumentu..."
        className="w-full"
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
}
