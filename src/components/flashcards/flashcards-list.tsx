import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, RotateCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { FlashcardDto } from "@/types";

interface FlashcardsListProps {
  flashcards: FlashcardDto[];
  isLoading: boolean;
  onEditFlashcard: (flashcardId: string, updates: Partial<FlashcardDto>) => Promise<void>;
  onDeleteFlashcard: (flashcardId: string) => void;
}

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onEdit: (flashcardId: string, updates: Partial<FlashcardDto>) => Promise<void>;
  onDelete: (flashcardId: string) => void;
}

function FlashcardCard({ flashcard, onEdit, onDelete }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Card className="relative group h-[300px] perspective-1000">
      <div
        className={`w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden">
          <CardHeader className="space-y-0">
            <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => setIsFlipped(!isFlipped)}>
                <RotateCw className="h-4 w-4" />
                <span className="sr-only">Odwróć fiszkę</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(flashcard.id, flashcard)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edytuj fiszkę</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(flashcard.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Usuń fiszkę</span>
              </Button>
            </div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  flashcard.source === "ai" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                }`}
              >
                {flashcard.source === "ai" ? "AI" : "Manualna"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Przód</h3>
              <p className="text-sm text-muted-foreground line-clamp-6">
                {flashcard.front_modified || flashcard.front_original}
              </p>
            </div>
          </CardContent>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <CardHeader className="space-y-0">
            <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => setIsFlipped(!isFlipped)}>
                <RotateCw className="h-4 w-4" />
                <span className="sr-only">Odwróć fiszkę</span>
              </Button>
            </div>
            <CardTitle className="text-sm font-medium">Tył fiszki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground line-clamp-6">
                {flashcard.back_modified || flashcard.back_original}
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

export function FlashcardsList({ flashcards, isLoading, onEditFlashcard, onDeleteFlashcard }: FlashcardsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-muted-foreground">Brak fiszek do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((flashcard) => (
        <FlashcardCard key={flashcard.id} flashcard={flashcard} onEdit={onEditFlashcard} onDelete={onDeleteFlashcard} />
      ))}
    </div>
  );
}
