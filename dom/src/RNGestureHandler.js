// @flow

import Hammer from 'hammerjs';

import { type UIView } from 'react-native-dom';
import {
  type RNGestureHandlerState,
  RNGestureHandlerStateUndetermined,
  RNGestureHandlerStateBegan,
  RNGestureHandlerStateEnd,
  RNGestureHandlerStateFailed,
  RNGestureHandlerStateCancelled,
  RNGestureHandlerStateActive,
} from './RNGestureHandlerState';
import {
  RNGestureHandlerEventExtraData,
  RNGestureHandlerEvent,
  RNGestureHandlerStateChangeEvent,
} from './RNGestureHandlerEvents';
import { RNGestureHandlerRegistry } from './RNGestureHandlerRegistry';

type RNGHHitSlop = {
  top: number,
  left: number,
  bottom: number,
  right: number,
  width: number,
  height: number,
};

const RNGHHitSlopEmpty = (): RNGHHitSlop => ({
  top: NaN,
  left: NaN,
  bottom: NaN,
  right: NaN,
  width: NaN,
  height: NaN,
});

export interface RNGestureHandlerEventEmitter {
  sendTouchEvent(event: RNGestureHandlerEvent): void,
  sendStateChangeEvent(event: RNGestureHandlerStateChangeEvent): void,
}

export class RNGestureHandler {
  recognizer: Hammer.Recognizer;

  tag: number;
  lastState: RNGestureHandlerState;
  handlersToWaitFor: number[];
  simultaniousHandlers: number[];
  hitSlop: RNGHHitSlop;
  enabled: boolean;
  shouldCancelWhenOutside: boolean;

  emitter: RNGestureHandlerEventEmitter;
  manager: ?Hammer.Manager;
  registry: RNGestureHandlerRegistry;

  constructor(tag: number) {
    this.tag = tag;
    this.lastState = RNGestureHandlerStateUndetermined;
    this.hitSlop = RNGHHitSlopEmpty();
    this.handlersToWaitFor = [];
    this.simultaniousHandlers = [];
  }

  configureWaitFor(waitFor: number[] = []) {
    const removedNodes = [];

    const prev = new Set(this.handlersToWaitFor);
    const next = new Set(waitFor);

    prev.forEach(prevTag => {
      if (!next.has(prevTag)) {
        removedNodes.push(this.registry.handlerWithTag(prevTag).recognizer);
      } else {
        next.delete(prevTag);
      }
    });

    // next now represents the added nodes
    next.forEach(tag => {
      this.recognizer.requireFailure(
        this.registry.handlerWithTag(tag).recognizer
      );
    });

    removedNodes.forEach(node => {
      this.recognizer.dropRequireFailure(node);
    });

    this.handlersToWaitFor = waitFor;
  }

  configureSimultaniousHandlers(simultaniousHandlers: number[] = []) {
    const removedNodes = [];

    const prev = new Set(this.simultaniousHandlers);
    const next = new Set(simultaniousHandlers);

    prev.forEach(prevTag => {
      if (!next.has(prevTag)) {
        removedNodes.push(this.registry.handlerWithTag(prevTag).recognizer);
      } else {
        next.delete(prevTag);
      }
    });

    // next now represents the added nodes
    next.forEach(tag => {
      this.recognizer.recognizeWith(
        this.registry.handlerWithTag(tag).recognizer
      );
    });

    removedNodes.forEach(node => {
      this.recognizer.dropRecognizeWith(node);
    });

    this.simultaniousHandlers = simultaniousHandlers;
  }

  configure(config: Object) {
    this.handlersToWaitFor = config.waitFor;
    this.simultaniousHandlers = config.simultaniousHandlers;

    const { enabled, shouldCancelWhenOutside } = config;

    this.enabled = enabled != null ? enabled : true;
    this.shouldCancelWhenOutside =
      shouldCancelWhenOutside != null ? shouldCancelWhenOutside : false;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.recognizer.set({ enable: enabled });
  }

  bindToManager(manager: Hammer.Manager) {
    manager.add(this.recognizer);
    this.manager = manager;
  }

  unbindFromManager() {
    if (this.manager) {
      this.manager.remove(this.recognizer);
      this.manager = null;
    }
  }

  eventExtraData(event: HammerEvent): RNGestureHandlerEventExtraData {
    return RNGestureHandlerEventExtraData.forPosition(
      {
        x: event.srcEvent.offsetX,
        y: event.srcEvent.offsetY,
      },
      { x: event.srcEvent.pageX, y: event.srcEvent.pageY },
      event.changedPointers.length
    );
  }

  handleGesture(event: HammerEvent) {
    const manager = this.manager;
    if (manager) {
      const eventData = this.eventExtraData(event);
      this.sendEvents(
        this.normalizeState(this.recognizer.state),
        manager.element.reactTag,
        eventData
      );
    }
  }

  sendEvents(
    state: RNGestureHandlerState,
    reactTag: number,
    eventData: RNGestureHandlerEventExtraData
  ) {
    const touchEvent = new RNGestureHandlerEvent(
      reactTag,
      this.tag,
      state,
      eventData
    );

    if (state !== this.lastState) {
      if (
        state === RNGestureHandlerStateEnd &&
        this.lastState !== RNGestureHandlerStateActive
      ) {
        this.emitter.sendStateChangeEvent(
          new RNGestureHandlerStateChangeEvent(
            reactTag,
            this.tag,
            RNGestureHandlerStateActive,
            this.lastState,
            eventData
          )
        );
        this.lastState = RNGestureHandlerStateActive;
      }
      const stateEvent = new RNGestureHandlerStateChangeEvent(
        reactTag,
        this.tag,
        state,
        this.lastState,
        eventData
      );
      this.emitter.sendStateChangeEvent(stateEvent);
      this.lastState = state;
    }

    if (state === RNGestureHandlerStateActive) {
      this.emitter.sendTouchEvent(touchEvent);
    }
  }

  normalizeState(inputState: number) {
    if (inputState & Hammer.STATE_FAILED) {
      return RNGestureHandlerStateFailed;
    } else if (inputState & Hammer.STATE_CANCELLED) {
      return RNGestureHandlerStateCancelled;
    } else if (inputState & Hammer.STATE_ENDED) {
      return RNGestureHandlerStateEnd;
    } else if (inputState & Hammer.STATE_CHANGED) {
      return RNGestureHandlerStateActive;
    } else if (
      inputState & Hammer.STATE_BEGAN ||
      inputState & Hammer.STATE_POSSIBLE
    ) {
      return RNGestureHandlerStateBegan;
    }

    return RNGestureHandlerStateUndetermined;
  }

  reset() {
    this.lastState = RNGestureHandlerStateUndetermined;
  }
}
