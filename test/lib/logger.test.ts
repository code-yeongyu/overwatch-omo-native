import { describe, expect, it } from "vitest";
import { ConsoleLogger, createLogger } from "../../src/lib/logger.js";

describe("ConsoleLogger", () => {
  it("filters messages below the configured level", () => {
    const logger = createLogger("warn");
    expect(logger.getLevel()).toBe("warn");

    let debugCalled = false;
    const originalLog = console.log;
    console.log = () => {
      debugCalled = true;
    };
    logger.debug("ignored");
    console.log = originalLog;

    expect(debugCalled).toBe(false);
  });

  it("allows the level to be changed at runtime", () => {
    const logger = createLogger("error");
    logger.setLevel("debug");
    expect(logger.getLevel()).toBe("debug");
  });

  it("logs messages at or above the configured level", () => {
    const logger = new ConsoleLogger("info");
    let captured = "";
    const originalLog = console.log;
    console.log = (msg: string) => {
      captured = msg;
    };
    logger.info("hello", { x: 1 });
    console.log = originalLog;

    const parsed = JSON.parse(captured);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("hello");
    expect(parsed.context).toEqual({ x: 1 });
  });
});
