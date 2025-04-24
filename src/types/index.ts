export interface TopicDto {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  documents_count: number;
  flashcards_count: number;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}
