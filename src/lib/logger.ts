export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  getLevel(): LogLevel;
  setLevel(level: LogLevel): void;
}

export class ConsoleLogger implements Logger {
  private level: LogLevel;
  private readonly namespace: string;

  constructor(level: LogLevel = "info", namespace = "game") {
    this.level = level;
    this.namespace = namespace;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) {
      return;
    }

    const entry = {
      time: new Date().toISOString(),
      level,
      namespace: this.namespace,
      message,
      context,
    };

    const output = JSON.stringify(entry);
    const sink = level === "warn" ? console.warn : level === "error" ? console.error : console.log;
    // biome-ignore lint/suspicious/noConsole: structured logging sink
    sink(output);
  }
}

export function createLogger(level: LogLevel = "info", namespace = "game"): Logger {
  return new ConsoleLogger(level, namespace);
}
