import { describe, expect, it } from "vitest";
import { createInputAdapter } from "../../src/engine/input.js";

describe("InputAdapter", () => {
  it("tracks held keys via code", () => {
    const input = createInputAdapter();
    const element = document.createElement("div");
    input.bindElement(element);

    const event = new KeyboardEvent("keydown", { code: "KeyW", key: "w" });
    document.dispatchEvent(event);
    const cmd = input.getCommand();
    expect(cmd.moveForward).toBe(true);

    input.unbind();
  });

  it("reports pressed keys for one frame", () => {
    const input = createInputAdapter();
    const element = document.createElement("div");
    input.bindElement(element);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " " }));
    const cmd1 = input.getCommand();
    expect(cmd1.jumpPressed).toBe(true);
    const cmd2 = input.getCommand();
    expect(cmd2.jumpPressed).toBe(false);

    input.unbind();
  });
});
