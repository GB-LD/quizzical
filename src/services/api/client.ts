import { ApiError, NetworkError } from "../../utils/errors";

interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

class HttpClient {
  private readonly defaultTimeout = 10000;
  private readonly defaultRetries = 2;

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const timeout = config?.timeout ?? this.defaultTimeout;
    const retries = config?.retries ?? this.defaultRetries;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.fetchWithTimeout<T>(url, timeout, config?.headers);
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries && this.isRetryableError(error)) {
          const delayMs = Math.pow(2, attempt) * 1000;
          console.log(
            `🔄 Retry attempt ${attempt + 1}/${retries} after ${delayMs}ms`,
          );
          await this.delay(delayMs);
          continue;
        }

        throw error;
      }
    }

    throw lastError ?? new Error("Unexpected error in HTTP client");
  }

  private async fetchWithTimeout<T>(
    url: string,
    timeout: number,
    customHeaders?: Record<string, string>,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...customHeaders,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new NetworkError("Requested timeout");
      }

      throw new NetworkError(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  private isRetryableError(error: unknown): boolean {
    return (
      error instanceof NetworkError ||
      (error instanceof ApiError && error.status >= 500)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const httpClient = new HttpClient();
