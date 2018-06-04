// @flow

import Hammer from 'hammerjs';
import type { UIView } from 'react-native-dom';
import { RNGestureHandler } from './RNGestureHandler';

export class RNGestureHandlerRegistry {
  handlers: { [number]: RNGestureHandler };
  managers: WeakMap<UIView, Hammer.Manager>;

  constructor() {
    this.handlers = {};
    this.managers = new WeakMap();
  }

  handlerWithTag(handlerTag: number) {
    return this.handlers[handlerTag];
  }

  registerGestureHandler(gestureHandler: RNGestureHandler) {
    this.handlers[gestureHandler.tag] = gestureHandler;
    gestureHandler.registry = this;
  }

  attachHandler(handlerTag: number, view: UIView) {
    const handler = this.handlers[handlerTag];
    if (handler) {
      let manager = this.managers.get(view);
      if (manager == null) {
        manager = new Hammer.Manager(view);
        this.managers.set(view, manager);
      }
      handler.unbindFromManager();
      handler.bindToManager(manager);
      view.touchable = true;
    }
  }

  dropHandler(handlerTag: number) {
    const handler = this.handlers[handlerTag];
    if (handler) {
      handler.unbindFromManager();
      delete this.handlers[handlerTag];
    }
  }
}
