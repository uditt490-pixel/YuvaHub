export type AdapterStage = "fetch" | "parse" | "normalize" | "ingest";

export type AdapterErrorCode =
  | "FETCH_FAILED"
  | "INVALID_JSON"
  | "INVALID_PAYLOAD"
  | "NORMALIZATION_FAILED"
  | "INGESTION_FAILED";

export interface AdapterFailureDetails {
  source: string;
  stage: AdapterStage;
  code: AdapterErrorCode;
  message: string;
  retryable: boolean;
  occurredAt: string;
}

const safeMessage = (value: unknown): string => {
  const message = value instanceof Error ? value.message : String(value);

  return message
    .replace(/https?:\/\/[^\s]+/gi, "[redacted-url]")
    .replace(
      /(?:api[_-]?key|token|secret|password)=?[^\s&]*/gi,
      "$1=[redacted]",
    )
    .slice(0, 500);
};

export class AdapterError extends Error {
  readonly source: string;
  readonly stage: AdapterStage;
  readonly code: AdapterErrorCode;
  readonly retryable: boolean;

  constructor(options: {
    source: string;
    stage: AdapterStage;
    code: AdapterErrorCode;
    message: string;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(options.message);
    if (options.cause) {
      (this as any).cause = options.cause;
    }
    this.name = "AdapterError";
    this.source = options.source;
    this.stage = options.stage;
    this.code = options.code;
    this.retryable = options.retryable ?? false;
  }

  toFailureDetails(): AdapterFailureDetails {
    return {
      source: this.source,
      stage: this.stage,
      code: this.code,
      message: safeMessage(this.message),
      retryable: this.retryable,
      occurredAt: new Date().toISOString(),
    };
  }
}

export function toAdapterError(
  source: string,
  stage: AdapterStage,
  error: unknown,
  fallbackCode: AdapterErrorCode,
  retryable = false,
): AdapterError {
  if (error instanceof AdapterError) return error;

  return new AdapterError({
    source,
    stage,
    code: fallbackCode,
    message: safeMessage(error),
    retryable,
    cause: error,
  });
}
