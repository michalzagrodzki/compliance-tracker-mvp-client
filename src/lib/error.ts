/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiError = {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
};

export type StreamError = ApiError & {
  type: 'STREAM_ERROR';
  phase: 'connection' | 'reading' | 'parsing' | 'completion';
};

export function normalizeError(e: unknown): ApiError {
  if (typeof e === "object" && e && "isAxiosError" in e) {
    const ax = e as any;
    return {
      status: ax.response?.status ?? 0,
      code: ax.response?.data?.code,
      message: ax.response?.data?.message ?? ax.message ?? "Network error",
      details: ax.response?.data,
    };
  }
  return {
    status: 0,
    message: e instanceof Error ? e.message : "Unknown error",
  };
}

export function normalizeStreamError(e: unknown, phase: StreamError['phase']): StreamError {
  const baseError = normalizeError(e);
  return {
    ...baseError,
    type: 'STREAM_ERROR',
    phase,
  };
}

export function isRetryableError(error: ApiError): boolean {
  return error.status >= 500 || error.status === 408 || error.status === 429;
}
