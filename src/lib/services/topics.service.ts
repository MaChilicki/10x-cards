import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { TopicDto, TopicCreateDto, TopicUpdateDto, TopicsListResponseDto } from "../../types";
import type { TopicQueryParams } from "../schemas/topics.schema";

export class TopicsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(params: TopicQueryParams): Promise<TopicsListResponseDto> {
    const { page, limit, sort, parent_id } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase.from("topics").select("*", { count: "exact" }).eq("user_id", DEFAULT_USER_ID);

    // Filtrowanie po parent_id
    if (parent_id === null) {
      query = query.is("parent_id", null);
    } else if (parent_id) {
      query = query.eq("parent_id", parent_id);
    }

    // Sortowanie i paginacja
    const {
      data: topics,
      count,
      error,
    } = await query.order(sort, { ascending: true }).range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Błąd podczas pobierania tematów: ${error.message}`);
    }

    return {
      topics: topics as TopicDto[],
      total: count || 0,
    };
  }

  async create(data: TopicCreateDto): Promise<TopicDto> {
    let query = this.supabase.from("topics").select("id").eq("name", data.name).eq("user_id", DEFAULT_USER_ID);

    // Dodajemy warunek na parent_id osobno, aby TypeScript był zadowolony
    if (data.parent_id === undefined) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", data.parent_id);
    }

    // Sprawdzenie unikalności nazwy dla tego samego rodzica
    const { data: existing, error: checkError } = await query.maybeSingle();

    if (checkError) {
      throw new Error(`Błąd podczas sprawdzania unikalności nazwy: ${checkError.message}`);
    }

    if (existing) {
      throw new Error("Temat o tej nazwie już istnieje dla tego samego rodzica");
    }

    const { data: topic, error } = await this.supabase
      .from("topics")
      .insert({
        ...data,
        user_id: DEFAULT_USER_ID,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Błąd podczas tworzenia tematu: ${error.message}`);
    }

    return topic as TopicDto;
  }

  async getById(id: string): Promise<TopicDto> {
    const { data: topic, error } = await this.supabase
      .from("topics")
      .select("*")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (error) {
      throw new Error(`Błąd podczas pobierania tematu: ${error.message}`);
    }

    if (!topic) {
      throw new Error("Temat nie został znaleziony");
    }

    return topic as TopicDto;
  }

  async update(id: string, data: TopicUpdateDto): Promise<TopicDto> {
    const topic = await this.getById(id);

    if (data.name && data.name !== topic.name) {
      let query = this.supabase
        .from("topics")
        .select("id")
        .eq("name", data.name)
        .eq("user_id", DEFAULT_USER_ID)
        .neq("id", id);

      // Dodajemy warunek na parent_id osobno
      if (topic.parent_id === null) {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", topic.parent_id);
      }

      // Sprawdzenie unikalności nowej nazwy
      const { data: existing, error: checkError } = await query.maybeSingle();

      if (checkError) {
        throw new Error(`Błąd podczas sprawdzania unikalności nazwy: ${checkError.message}`);
      }

      if (existing) {
        throw new Error("Temat o tej nazwie już istnieje dla tego samego rodzica");
      }
    }

    const { data: updated, error } = await this.supabase
      .from("topics")
      .update(data)
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .select()
      .single();

    if (error) {
      throw new Error(`Błąd podczas aktualizacji tematu: ${error.message}`);
    }

    return updated as TopicDto;
  }

  async delete(id: string): Promise<void> {
    // Sprawdzenie czy temat ma podrzędne tematy
    const { data: childTopics, error: childError } = await this.supabase
      .from("topics")
      .select("id, name")
      .eq("parent_id", id)
      .eq("user_id", DEFAULT_USER_ID);

    if (childError) {
      throw new Error(`Błąd podczas sprawdzania podrzędnych tematów: ${childError.message}`);
    }

    if (childTopics && childTopics.length > 0) {
      throw new Error("Nie można usunąć tematu, który ma podrzędne tematy");
    }

    // Sprawdzenie czy temat ma przypisane dokumenty
    const { data: documents, error: docError } = await this.supabase
      .from("documents")
      .select("id, name")
      .eq("topic_id", id);

    if (docError) {
      throw new Error(`Błąd podczas sprawdzania dokumentów: ${docError.message}`);
    }

    if (documents && documents.length > 0) {
      throw new Error("Nie można usunąć tematu, który ma przypisane dokumenty");
    }

    // Sprawdzenie czy temat ma przypisane fiszki
    const { count: flashcardsCount, error: flashError } = await this.supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("topic_id", id);

    if (flashError) {
      throw new Error(`Błąd podczas sprawdzania fiszek: ${flashError.message}`);
    }

    if (flashcardsCount && flashcardsCount > 0) {
      throw new Error("Nie można usunąć tematu, który ma przypisane fiszki");
    }

    const { error } = await this.supabase.from("topics").delete().eq("id", id).eq("user_id", DEFAULT_USER_ID);

    if (error) {
      throw new Error(`Błąd podczas usuwania tematu: ${error.message}`);
    }
  }
}
