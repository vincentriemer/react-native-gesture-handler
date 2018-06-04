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

const EVENTS = 'pinchstart pinchmove pinchend pinchcancel pinchin pinchout';

export class RNPinchGestureHandler extends RNGestureHandler {
  boundHandleGesture: Function;

  constructor(tag: number) {
    super(tag);
    this.recognizer = new Hammer.Pinch();
    this.boundHandleGesture = this.handleGesture.bind(this);
  }

  eventExtraData(event: HammerEvent) {
    return RNGestureHandlerEventExtraData.forPinch(
      event.scale,
      event.center,
      event.velocity,
      event.changedPointers.length
    );
  }

  bindToManager(manager: Hammer.Manager) {
    super.bindToManager(manager);
    if (manager) manager.on(EVENTS, this.boundHandleGesture);
  }

  unbindFromManager() {
    if (this.manager) this.manager.off(EVENTS, this.boundHandleGesture);
    super.unbindFromManager();
  }
}
