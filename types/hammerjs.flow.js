import type { UIView } from 'react-native-dom';

declare module 'hammerjs' {
  declare class Hammer {
    static defaults: {},
  }

  declare class Recognizer {
    state: number,

    constructor(options?: Object): Recognizer,

    set(options: Object): void,

    requireFailure(rec: Recognizer): void,
    dropRequireFailure(rec: Recognizer): void,

    recognizeWith(rec: Recognizer): void,
    dropRecognizeWith(rec: Recognizer): void,
  }
  declare class AttrRecognizer extends Recognizer {}
  declare class TapRecognizer extends AttrRecognizer {}
  declare class PanRecognizer extends AttrRecognizer {}
  declare class SwipeRecognizer extends AttrRecognizer {}
  declare class PinchRecognizer extends AttrRecognizer {}
  declare class RotateRecognizer extends AttrRecognizer {}
  declare class PressRecognizer extends AttrRecognizer {}

  declare class Manager {
    element: UIView,

    constructor(element: UIView, options?: Object): Manager,
    add(recognizer: Recognizer): void,
    remove(recognizer: Recognizer): void,
    on(targets: string, handler: (event: HammerEvent) => void): void,
    off(targets: string, handler: (event: HammerEvent) => void): void,
  }

  declare module.exports: Hammer & {
    Recognizer: typeof Recognizer,
    AttrRecognizer: typeof AttrRecognizer,
    Tap: typeof TapRecognizer,
    Pan: typeof PanRecognizer,
    Swipe: typeof SwipeRecognizer,
    Pinch: typeof PinchRecognizer,
    Rotate: typeof RotateRecognizer,
    Press: typeof PressRecognizer,

    Manager: typeof Manager,

    // Constants
    INPUT_START: number,
    INPUT_MOVE: number,
    INPUT_END: number,
    INPUT_CANCEL: number,

    STATE_POSSIBLE: number,
    STATE_BEGAN: number,
    STATE_CHANGED: number,
    STATE_ENDED: number,
    STATE_RECOGNIZED: number,
    STATE_CANCELLED: number,
    STATE_FAILED: number,

    DIRECTION_NONE: number,
    DIRECTION_LEFT: number,
    DIRECTION_RIGHT: number,
    DIRECTION_UP: number,
    DIRECTION_DOWN: number,
    DIRECTION_HORIZONTAL: number,
    DIRECTION_VERTICAL: number,
    DIRECTION_ALL: number,
  };
}

declare type HammerEvent = {
  type: string,
  deltaX: number,
  deltaY: number,
  deltaTime: number,
  distance: number,
  angle: number,
  velocityX: number,
  velocityY: number,
  velocity: number,
  direction: number,
  offsetDirection: number,
  scale: number,
  rotation: number,
  center: { x: number, y: number },
  srcEvent: MouseEvent,
  target: HTMLElement,
  pointerType: 'touch' | 'mouse' | 'pen' | 'kinect',
  eventType: number,
  isFirst: boolean,
  isFinal: boolean,
  pointers: any[],
  changedPointers: any[],
  preventDefault: () => void,
};
