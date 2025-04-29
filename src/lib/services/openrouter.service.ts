import fetch from "cross-fetch";
import type { OpenRouterConfig, ChatParams, ChatMessage, ChatCompletionResponse } from "../../types/openrouter.types";
import { ApiError, NetworkError, ValidationError } from "../../types/openrouter.types";
import { logger } from "./logger.service";

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private defaultParams: Omit<ChatParams, "model">;
  private retryConfig: RetryConfig;

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new ValidationError("Brak klucza API");
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? "https://openrouter.ai/api/v1";
    this.defaultModel = config.defaultModel ?? "openai/gpt-4";
    this.defaultParams = config.defaultParams ?? {
      parameter: 1.0,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    };

    // Konfiguracja mechanizmu ponownych prób
    this.retryConfig = {
      maxRetries: 3,
      initialDelay: 1000, // 1 sekunda
      maxDelay: 10000, // 10 sekund
    };
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public async chat(
    systemMessage: string,
    userMessage: string,
    params?: Partial<Omit<ChatParams, "model">> & Partial<Pick<ChatParams, "model">>
  ): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ];

    const payload = {
      model: params?.model ?? this.defaultModel,
      messages,
      ...this.defaultParams,
      ...params,
    };

    return this.sendRequestWithRetry(payload);
  }

  private async sendRequestWithRetry(
    payload: ChatParams & { messages: ChatMessage[] },
    retryCount = 0
  ): Promise<ChatCompletionResponse> {
    try {
      return await this.sendRequest(payload);
    } catch (error) {
      // Nie ponawiamy prób dla błędów walidacji i niektórych błędów API
      if (
        error instanceof ValidationError ||
        (error instanceof ApiError && error.statusCode && error.statusCode < 500)
      ) {
        throw error;
      }

      // Sprawdzamy czy możemy ponowić próbę
      if (retryCount < this.retryConfig.maxRetries) {
        // Obliczamy opóźnienie z wykładniczym wzrostem (exponential backoff)
        const delay = Math.min(this.retryConfig.initialDelay * Math.pow(2, retryCount), this.retryConfig.maxDelay);

        // Dodajemy losowy jitter (±100ms) aby uniknąć efektu thundering herd
        const jitter = Math.random() * 200 - 100;
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));

        // Ponowna próba
        return this.sendRequestWithRetry(payload, retryCount + 1);
      }

      throw error;
    }
  }

  private async sendRequest(payload: ChatParams & { messages: ChatMessage[] }): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(`API Error: ${response.status} - ${errorText}`, response.status);
      }

      const data = await response.json();

      // Logowanie odpowiedzi przed walidacją
      logger.debug("Odpowiedź z OpenRouter API: " + JSON.stringify({ payload, response: data }, null, 2));

      // Walidacja odpowiedzi
      if (!this.isValidChatCompletionResponse(data)) {
        logger.error("Nieprawidłowa struktura odpowiedzi z API: " + JSON.stringify(data, null, 2));
        throw new ValidationError("Nieprawidłowa struktura odpowiedzi z API");
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError || error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new NetworkError(`Network error: ${error.message}`);
      }
      throw new NetworkError("Nieznany błąd sieciowy");
    }
  }

  private isValidChatCompletionResponse(data: unknown): data is ChatCompletionResponse {
    if (!data || typeof data !== "object") return false;

    const response = data as Partial<ChatCompletionResponse>;

    return (
      typeof response.id === "string" &&
      response.object === "chat.completion" &&
      typeof response.created === "number" &&
      typeof response.model === "string" &&
      Array.isArray(response.choices) &&
      response.choices.length > 0 &&
      typeof response.usage === "object" &&
      typeof response.usage?.prompt_tokens === "number" &&
      typeof response.usage?.completion_tokens === "number" &&
      typeof response.usage?.total_tokens === "number"
    );
  }
}
