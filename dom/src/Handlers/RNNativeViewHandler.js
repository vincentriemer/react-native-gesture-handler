// @flow

import Hammer from 'hammerjs';
import detectIt from 'detect-it';
import RCTScrollView from 'react-native-dom/lib/views/RCTScrollView';
import { RNGestureHandler } from '../RNGestureHandler';
import { RNGestureHandlerButton } from '../RNGestureHandlerButton';
import { RNGestureHandlerEventExtraData } from '../RNGestureHandlerEvents';
import {
  RNGestureHandlerStateActive,
  RNGestureHandlerStateEnd,
  RNGestureHandlerStateCancelled,
} from '../RNGestureHandlerState';
import RCTView from 'react-native-dom/lib/views/RCTView';

const LISTENER_OPTIONS = detectIt.passiveEvents ? { passive: false } : false;

export class RNNativeViewGestureHandler extends RNGestureHandler {
  shouldActivateOnStart: boolean;
  disallowInterruption: boolean;
  boundHandleGesture: Function;

  constructor(tag: number) {
    super(tag);
    this.recognizer = new Hammer.Recognizer();
    this.boundHandleGesture = this.handleGesture.bind(this);
  }

  configure(config: Object) {
    super.configure(config);
    this.shouldActivateOnStart = config.shouldActivateOnStart;
    this.disallowInterruption = config.disallowInterruption;
  }

  // $FlowFixMe
  bindToManager(manager: Hammer.Manager) {
    const view = manager.element;

    if (view instanceof RNGestureHandlerButton) {
      view.addEventListener(
        'pointerdown',
        this.handleTouchDown,
        LISTENER_OPTIONS
      );
      view.addEventListener('pointerup', this.handleTouchUp, LISTENER_OPTIONS);
      view.addEventListener(
        'pointerenter',
        this.handleDragEnter,
        LISTENER_OPTIONS
      );
      view.addEventListener(
        'pointerleave',
        this.handleDragExit,
        LISTENER_OPTIONS
      );
      view.addEventListener(
        'pointercancel',
        this.handleTouchCancel,
        LISTENER_OPTIONS
      );
      this.manager = manager;
      // this.recognizer = new Hammer.Press({ time: 50 });
      // manager.add(this.recognizer);
      // manager.on(
      //   "press pressup",
      //   e => console.log(e) && this.boundHandleGesture(e)
      // );
    } else {
      super.bindToManager(manager);
    }

    if (view instanceof RCTScrollView) {
      // TODO: Do we need to do anything here?
    }
  }

  unbindFromManager() {
    super.unbindFromManager();
  }

  unbindEvents(manager: Hammer.Manager) {
    manager.element.removeEventListener(
      'pointerenter',
      this.handleDragEnter,
      LISTENER_OPTIONS
    );
    manager.element.removeEventListener(
      'pointerleave',
      this.handleDragExit,
      LISTENER_OPTIONS
    );
  }

  handleTouchDown = (event: PointerEvent) => {
    const manager = this.manager;
    if (manager && this.enabled) {
      this.sendEvents(
        RNGestureHandlerStateActive,
        manager.element.reactTag,
        RNGestureHandlerEventExtraData.forPointerInside(true)
      );
      manager.element.addEventListener(
        'pointerenter',
        this.handleDragEnter,
        false
      );
      manager.element.addEventListener(
        'pointerleave',
        this.handleDragExit,
        false
      );
    }
  };

  handleTouchUp = (event: PointerEvent) => {
    const manager = this.manager;
    if (manager) {
      this.sendEvents(
        RNGestureHandlerStateEnd,
        manager.element.reactTag,
        RNGestureHandlerEventExtraData.forPointerInside(true)
      );
      this.unbindEvents(manager);
    }
  };

  handleDragExit = (event: PointerEvent) => {
    const manager = this.manager;
    if (manager) {
      if (this.shouldCancelWhenOutside) {
        this.sendEvents(
          RNGestureHandlerStateEnd,
          manager.element.reactTag,
          RNGestureHandlerEventExtraData.forPointerInside(false)
        );
        this.unbindEvents(manager);
      } else {
        this.sendEvents(
          RNGestureHandlerStateActive,
          manager.element.reactTag,
          RNGestureHandlerEventExtraData.forPointerInside(false)
        );
      }
    }
  };

  handleDragEnter = () => {};

  handleTouchCancel = (event: PointerEvent) => {
    const manager = this.manager;
    if (manager) {
      this.sendEvents(
        RNGestureHandlerStateCancelled,
        manager.element.reactTag,
        RNGestureHandlerEventExtraData.forPointerInside(false)
      );
      this.unbindEvents(manager);
    }
  };
}
