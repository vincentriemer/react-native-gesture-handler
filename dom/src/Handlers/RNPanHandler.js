// @flow
import Hammer from 'hammerjs';
import { RNGestureHandler } from '../RNGestureHandler';
import { RNGestureHandlerEventExtraData } from '../RNGestureHandlerEvents';

type RNGHOptions = {
  minDeltaX?: number,
  minDeltaY?: number,
  minPointers?: number,
  minDist?: number,
};

type HammerOptions = {
  pointers: number,
  threshold: number,
  direction: number,
};

const EVENTS =
  'panstart panmove panend pancancel panleft panright panup pandown';

export class RNPanGestureHandler extends RNGestureHandler {
  boundHandleGesture: Function;

  constructor(tag: number) {
    super(tag);
    this.recognizer = new Hammer.Pan();
    this.boundHandleGesture = this.handleGesture.bind(this);
  }

  eventExtraData(event: HammerEvent) {
    return RNGestureHandlerEventExtraData.forPan(
      {
        x: event.srcEvent.offsetX,
        y: event.srcEvent.offsetY,
      },
      { x: event.srcEvent.pageX, y: event.srcEvent.pageY },
      { x: event.deltaX, y: event.deltaY },
      { x: event.velocityX, y: event.velocityY },
      event.changedPointers.length
    );
  }

  configure(config: Object & RNGHOptions) {
    super.configure(config);

    const newOptions = {};
    if (config.minDeltaX != null && config.minDeltaY != null) {
      newOptions.direction = Hammer.DIRECTION_ALL;
      newOptions.threshold = Math.min(config.minDeltaX, config.minDeltaY);
    } else if (config.minDeltaX != null) {
      newOptions.direction = Hammer.DIRECTION_HORIZONTAL;
      newOptions.threshold = config.minDeltaX;
    } else if (config.minDeltaY != null) {
      newOptions.direction = Hammer.DIRECTION_VERTICAL;
      newOptions.threshold = config.minDeltaY;
    } else {
      newOptions.threshold = null;
    }

    if (config.minDist != null) {
      newOptions.threshold = config.minDist;
    } else {
      config.threshold = 1;
    }

    if (config.minPointers != null) {
      newOptions.minPointers = config.minPointers;
    }

    this.recognizer.set(newOptions);
  }

  bindToManager(manager: Hammer.Manager) {
    super.bindToManager(manager);
    if (manager) manager.on(EVENTS, this.boundHandleGesture);
  }

  unbindFromManager() {
    if (this.manager) {
      this.manager.off(EVENTS, this.boundHandleGesture);
    }
    super.unbindFromManager();
  }
}
