// @flow
import Hammer from 'hammerjs';
import { RNGestureHandler } from '../RNGestureHandler';
import { RNGestureHandlerEventExtraData } from '../RNGestureHandlerEvents';

type HammerOptions = {
  pointers: number,
  taps: number,
  interval: number,
  time: number,
  posThreshold: number,
};

const EVENTS = 'rotatestart rotatemove rotateend rotatecancel';

export class RNRotationGestureHandler extends RNGestureHandler {
  rotationAtStart = 0;

  constructor(tag: number) {
    super(tag);
    this.recognizer = new Hammer.Rotate();
  }

  handlePinch = (event: HammerEvent) => {
    switch (event.eventType) {
      case Hammer.INPUT_START: {
        this.rotationAtStart = event.rotation;
        event.rotation = 0;
        break;
      }
      default: {
        event.rotation = event.rotation - this.rotationAtStart;
      }
    }

    this.handleGesture(event);
  };

  eventExtraData(event: HammerEvent) {
    return RNGestureHandlerEventExtraData.forRotation(
      event.rotation * (Math.PI / 180),
      event.center,
      event.velocity,
      event.changedPointers.length
    );
  }

  bindToManager(manager: Hammer.Manager) {
    super.bindToManager(manager);
    if (manager) manager.on(EVENTS, this.handlePinch);
  }

  unbindFromManager() {
    if (this.manager) this.manager.off(EVENTS, this.handlePinch);
    super.unbindFromManager();
  }
}
