export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NetworkError extends Error {
  name: string;

  constructor(message = "Network error") {
    super(message);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ValidationError extends Error {
  name: string;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export const ERROR_MESSAGES = {
  SERVER_ERROR:
    "The server is experiencing difficulties. Please try again later",
  NOT_FOUND: "Resource not found",
  RATE_LIMIT: "Too many requests. Please wait a few moments.",
  NETWORK_ERROR: "Connection problem. Check your internet connection",
} as const;
