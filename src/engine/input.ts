export interface InputCommand {
  moveForward: boolean;
  moveBack: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  sprint: boolean;
  fire: boolean;
  jumpPressed: boolean;
  reloadPressed: boolean;
  ability1Pressed: boolean;
  ultimatePressed: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
}

export interface InputAdapter {
  getCommand(): InputCommand;
  bindElement(element: HTMLElement): void;
  unbind(): void;
  isPointerLocked(): boolean;
}

export const DEFAULT_BINDINGS: Record<string, keyof InputCommand> = {
  KeyW: "moveForward",
  KeyS: "moveBack",
  KeyA: "moveLeft",
  KeyD: "moveRight",
  ShiftLeft: "sprint",
  MouseLeft: "fire",
  Space: "jumpPressed",
  KeyR: "reloadPressed",
  KeyE: "ability1Pressed",
  KeyQ: "ultimatePressed",
};

export function createInputAdapter(bindings = DEFAULT_BINDINGS): InputAdapter {
  const held = new Set<string>();
  const pressedThisFrame = new Set<string>();
  let lookDeltaX = 0;
  let lookDeltaY = 0;
  let pointerLocked = false;
  let boundElement: HTMLElement | null = null;

  function isBindingActive(action: keyof InputCommand): boolean {
    for (const [code, boundAction] of Object.entries(bindings)) {
      if (boundAction === action && held.has(code)) {
        return true;
      }
    }
    return false;
  }

  function wasBindingPressed(action: keyof InputCommand): boolean {
    for (const [code, boundAction] of Object.entries(bindings)) {
      if (boundAction === action && pressedThisFrame.has(code)) {
        return true;
      }
    }
    return false;
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (bindings[event.code] && !held.has(event.code)) {
      held.add(event.code);
      pressedThisFrame.add(event.code);
      event.preventDefault();
    }
  }

  function onKeyUp(event: KeyboardEvent): void {
    held.delete(event.code);
    event.preventDefault();
  }

  function onMouseDown(event: MouseEvent): void {
    const code = event.button === 0 ? "MouseLeft" : `Mouse${event.button}`;
    if (bindings[code] && !held.has(code)) {
      held.add(code);
      pressedThisFrame.add(code);
    }
  }

  function onMouseUp(event: MouseEvent): void {
    const code = event.button === 0 ? "MouseLeft" : `Mouse${event.button}`;
    held.delete(code);
  }

  function onMouseMove(event: MouseEvent): void {
    if (pointerLocked) {
      lookDeltaX += event.movementX;
      lookDeltaY += event.movementY;
    }
  }

  function onPointerLockChange(): void {
    pointerLocked = document.pointerLockElement === boundElement;
  }

  function clear(): void {
    held.clear();
    pressedThisFrame.clear();
    lookDeltaX = 0;
    lookDeltaY = 0;
  }

  return {
    bindElement(element) {
      if (boundElement) {
        this.unbind();
      }
      boundElement = element;
      element.addEventListener("click", () => {
        element.requestPointerLock().catch(() => {
          // Pointer lock may be unavailable; ignore.
        });
      });
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("pointerlockchange", onPointerLockChange);
      window.addEventListener("blur", clear);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          clear();
        }
      });
    },
    unbind() {
      if (!boundElement) {
        return;
      }
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      window.removeEventListener("blur", clear);
      boundElement = null;
      pointerLocked = false;
      clear();
    },
    getCommand() {
      const command: InputCommand = {
        moveForward: isBindingActive("moveForward"),
        moveBack: isBindingActive("moveBack"),
        moveLeft: isBindingActive("moveLeft"),
        moveRight: isBindingActive("moveRight"),
        sprint: isBindingActive("sprint"),
        fire: isBindingActive("fire"),
        jumpPressed: wasBindingPressed("jumpPressed"),
        reloadPressed: wasBindingPressed("reloadPressed"),
        ability1Pressed: wasBindingPressed("ability1Pressed"),
        ultimatePressed: wasBindingPressed("ultimatePressed"),
        lookDeltaX,
        lookDeltaY,
      };
      lookDeltaX = 0;
      lookDeltaY = 0;
      pressedThisFrame.clear();
      return command;
    },
    isPointerLocked() {
      return pointerLocked;
    },
  };
}
