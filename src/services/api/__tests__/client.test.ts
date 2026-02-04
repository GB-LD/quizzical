import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";

describe("HttpClient", () => {
  // Import dynamically to avoid module caching issues
  let httpClient: typeof import("../client").httpClient;
  let ApiError: typeof import("../../../utils/errors").ApiError;
  let NetworkError: typeof import("../../../utils/errors").NetworkError;

  beforeEach(async () => {
    vi.useFakeTimers();
    globalThis.fetch = vi.fn();

    // Reset modules and re-import everything together
    vi.resetModules();
    const clientModule = await import("../client");
    const errorsModule = await import("../../../utils/errors");

    httpClient = clientModule.httpClient;
    ApiError = errorsModule.ApiError;
    NetworkError = errorsModule.NetworkError;
  });

  afterEach(async () => {
    // Run any pending timers to avoid dangling promises
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("get", () => {
    it("returns data on successful response", async () => {
      const mockData = { results: [1, 2, 3] };
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await httpClient.get("/api/test");

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("includes Accept header by default", async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await httpClient.get("/api/test");

      expect(fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: "application/json",
          }),
        })
      );
    });

    it("merges custom headers with defaults", async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await httpClient.get("/api/test", {
        headers: { Authorization: "Bearer token" },
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: "application/json",
            Authorization: "Bearer token",
          }),
        })
      );
    });

    it("throws ApiError on non-ok response", async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const promise = httpClient.get("/api/test");

      await expect(promise).rejects.toThrow(ApiError);
      await expect(promise).rejects.toThrow("HTTP 404: Not Found");
    });

    it("throws ApiError with correct status code", async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      });

      await expect(httpClient.get("/api/test")).rejects.toMatchObject({
        status: 403,
      });
    });

    it("throws NetworkError on fetch failure", async () => {
      (fetch as Mock).mockRejectedValueOnce(new Error("Failed to fetch"));

      await expect(httpClient.get("/api/test", { retries: 0 })).rejects.toThrow(
        NetworkError
      );
    });

    it("throws NetworkError on timeout", async () => {
      // Mock fetch to hang until abort
      (fetch as Mock).mockImplementation(
        (_url: string, options: { signal: AbortSignal }) => {
          return new Promise((_, reject) => {
            options.signal.addEventListener("abort", () => {
              const error = new Error("Aborted");
              error.name = "AbortError";
              reject(error);
            });
          });
        }
      );

      // Attach rejection handler immediately before advancing timers
      const expectation = expect(
        httpClient.get("/api/test", { timeout: 100, retries: 0 })
      ).rejects.toThrow(NetworkError);

      // Advance timer to trigger abort
      await vi.advanceTimersByTimeAsync(150);

      // Wait for the expectation to resolve
      await expectation;
    });
  });

  describe("retry logic", () => {
    it("retries on network error", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      (fetch as Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const promise = httpClient.get("/api/test", { retries: 2 });

      // First retry after 1s
      await vi.advanceTimersByTimeAsync(1000);
      // Second retry after 2s
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(result).toEqual({ success: true });
      expect(fetch).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });

    it("retries on 5xx errors", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      (fetch as Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ recovered: true }),
        });

      const promise = httpClient.get("/api/test", { retries: 1 });

      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toEqual({ recovered: true });
      expect(fetch).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it("does not retry on 4xx errors", async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      await expect(
        httpClient.get("/api/test", { retries: 2 })
      ).rejects.toThrow(ApiError);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("does not retry on 404 errors", async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(
        httpClient.get("/api/test", { retries: 2 })
      ).rejects.toThrow(ApiError);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("uses exponential backoff for retries", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      (fetch as Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });

      const promise = httpClient.get("/api/test", { retries: 2 });

      // First delay: 2^0 * 1000 = 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Retry attempt 1/2 after 1000ms")
      );

      // Second delay: 2^1 * 1000 = 2000ms
      await vi.advanceTimersByTimeAsync(2000);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Retry attempt 2/2 after 2000ms")
      );

      await promise;
      consoleSpy.mockRestore();
    });

    it("stops retrying after max attempts", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      // Use mockRejectedValueOnce for each expected call to avoid dangling promises
      (fetch as Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"));

      // Attach rejection handler immediately before advancing timers
      const expectation = expect(
        httpClient.get("/api/test", { retries: 2 })
      ).rejects.toThrow(NetworkError);

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      // Wait for the expectation to resolve
      await expectation;

      expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries

      consoleSpy.mockRestore();
    });

    it("respects custom retry count", async () => {
      (fetch as Mock).mockRejectedValueOnce(new Error("Network error"));

      await expect(
        httpClient.get("/api/test", { retries: 0 })
      ).rejects.toThrow(NetworkError);

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
