import type { Database } from "./db/database.types";

// ------------------------------------------------------------------------------------------------
// Aliasy typów bazodanowych
// ------------------------------------------------------------------------------------------------
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type FlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];

export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];

export type Topic = Database["public"]["Tables"]["topics"]["Row"];
export type TopicInsert = Database["public"]["Tables"]["topics"]["Insert"];

export type StudySession = Database["public"]["Tables"]["study_sessions"]["Row"];
export type StudySessionInsert = Database["public"]["Tables"]["study_sessions"]["Insert"];

export type StudySessionResult = Database["public"]["Tables"]["study_session_results"]["Row"];
export type StudySessionResultInsert = Database["public"]["Tables"]["study_session_results"]["Insert"];

export type UserStatistics = Database["public"]["Tables"]["user_statistics"]["Row"];

// ------------------------------------------------------------------------------------------------
// Source literal type for flashcards
// ------------------------------------------------------------------------------------------------
export type FlashcardSource = "ai" | "manual";

// ------------------------------------------------------------------------------------------------
// Flashcard DTOs
// ------------------------------------------------------------------------------------------------
export type FlashcardDto = Pick<
  Flashcard,
  | "id"
  | "front_original"
  | "back_original"
  | "topic_id"
  | "document_id"
  | "created_at"
  | "modification_percentage"
  | "is_ai_generated"
  | "is_disabled"
>;

// ------------------------------------------------------------------------------------------------
// Pagination DTO
// ------------------------------------------------------------------------------------------------
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

// ------------------------------------------------------------------------------------------------
// Flashcards list response
// ------------------------------------------------------------------------------------------------
export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

// ------------------------------------------------------------------------------------------------
// Flashcard create DTO and command
// ------------------------------------------------------------------------------------------------
export interface FlashcardCreateDto {
  front_original: string;
  back_original: string;
  topic_id?: string;
  document_id?: string;
  source: FlashcardSource;
}

export interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}

// ------------------------------------------------------------------------------------------------
// Flashcard update DTO
// ------------------------------------------------------------------------------------------------
export type FlashcardUpdateDto = Partial<{
  front_modified: string;
  back_modified: string;
}>;

// ------------------------------------------------------------------------------------------------
// Flashcard AI generation input
// ------------------------------------------------------------------------------------------------
export interface FlashcardAiGenerateDto {
  text: string;
  topic_id?: string;
  document_id?: string;
}

// ------------------------------------------------------------------------------------------------
// Flashcard AI proposal (not yet saved)
// ------------------------------------------------------------------------------------------------
export interface FlashcardProposalDto {
  front_original: string;
  back_original: string;
  topic_id?: string;
  document_id?: string;
  source: "ai";
}

// ------------------------------------------------------------------------------------------------
// Flashcard AI response DTO
// ------------------------------------------------------------------------------------------------
export interface FlashcardAiResponse {
  flashcards: FlashcardProposalDto[];
}

// ------------------------------------------------------------------------------------------------
// Topic DTOs
// ------------------------------------------------------------------------------------------------
export type TopicDto = Topic;

export interface TopicCreateDto {
  name: string;
  description?: string;
  parent_id?: string;
}

export type TopicUpdateDto = Partial<{
  name: string;
  description: string;
}>;

export interface TopicsListResponseDto {
  topics: TopicDto[];
  total: number;
}

// ------------------------------------------------------------------------------------------------
// Document DTOs
// ------------------------------------------------------------------------------------------------
export type DocumentDto = Document;

export interface DocumentCreateDto {
  name: string;
  content: string;
}

export type DocumentUpdateDto = Partial<{
  name: string;
  content: string;
}>;

export interface DocumentsListResponseDto {
  documents: DocumentDto[];
  total: number;
}

// ------------------------------------------------------------------------------------------------
// Study Session DTOs
// ------------------------------------------------------------------------------------------------
export type StudySessionDto = StudySession;

export interface StudySessionCreateDto {
  topic_id?: string;
}

export interface StudySessionUpdateDto {
  end_time: string;
}

export interface StudySessionsListResponseDto {
  study_sessions: StudySessionDto[];
  total: number;
}

// ------------------------------------------------------------------------------------------------
// Study Session Result DTOs
// ------------------------------------------------------------------------------------------------
export type StudySessionResultDto = StudySessionResult;

export interface StudySessionResultCreateDto {
  session_id: string;
  flashcard_id: string;
  is_correct: boolean;
  response_time: number;
  difficulty_rating?: number;
}

export interface StudySessionResultsListResponseDto {
  results: StudySessionResultDto[];
  total: number;
}

// ------------------------------------------------------------------------------------------------
// User Statistics DTO
// ------------------------------------------------------------------------------------------------
export type UserStatisticsDto = UserStatistics;
