// @flow
import Hammer from 'hammerjs';
import { RNGestureHandler } from '../RNGestureHandler';

type HammerOptions = {
  pointers: number,
  taps: number,
  interval: number,
  time: number,
  posThreshold: number,
};

export class RNTapGestureHandler extends RNGestureHandler {
  boundHandleGesture: Function;

  constructor(tag: number) {
    super(tag);
    this.recognizer = new Hammer.Tap();
    this.boundHandleGesture = this.handleGesture.bind(this);
  }

  configure(config: Object) {
    super.configure(config);

    const newConfig = {};
    newConfig.taps = config.numberOfTaps ? config.numberOfTaps : 1;
    newConfig.pointers = config.minPointers ? config.minPointers : 1;

    const maxDelayMs = config.maxDelayMs;
    if (maxDelayMs) {
      newConfig.interval = maxDelayMs;
    }

    const maxDurationMs = config.maxDurationMs;
    if (maxDurationMs) {
      newConfig.time = maxDurationMs;
    }

    const maxDist = config.maxDist;
    if (maxDist) {
      newConfig.posThreshold = maxDist;
    }

    this.recognizer.set(newConfig);
  }

  bindToManager(manager: Hammer.Manager) {
    super.bindToManager(manager);
    if (manager) manager.on('tap', this.boundHandleGesture);
  }

  unbindFromManager() {
    if (this.manager) this.manager.off('tap', this.boundHandleGesture);
    super.unbindFromManager();
  }
}
