// @flow

import invariant from 'invariant';
import {
  type RCTUIManager,
  type RCTEventDispatcher,
  type UIView,
} from 'react-native-dom';
import {
  RNGestureHandlerEventEmitter,
  RNGestureHandler,
} from './RNGestureHandler';
import {
  RNGestureHandlerEvent,
  RNGestureHandlerStateChangeEvent,
} from './RNGestureHandlerEvents';
import { RNGestureHandlerRegistry } from './RNGestureHandlerRegistry';
import { RNNativeViewGestureHandler } from './Handlers/RNNativeViewHandler';
import { RNPanGestureHandler } from './Handlers/RNPanHandler';
import { RNTapGestureHandler } from './Handlers/RNTapHandler';
import { RNPinchGestureHandler } from './Handlers/RNPinchHandler';
import { RNRotationGestureHandler } from './Handlers/RNRotationHandler';

const HANLDER_MAP: { [string]: ?Class<RNGestureHandler> } = {
  PanGestureHandler: RNPanGestureHandler,
  NativeViewGestureHandler: RNNativeViewGestureHandler,
  TapGestureHandler: RNTapGestureHandler,
  PinchGestureHandler: RNPinchGestureHandler,
  RotationGestureHandler: RNRotationGestureHandler,
};

const DEBUG = false;

export class RNGestureHandlerManager implements RNGestureHandlerEventEmitter {
  uiManager: RCTUIManager;
  eventDispatcher: RCTEventDispatcher;
  rootViews: Set<UIView>;
  registry: RNGestureHandlerRegistry;

  constructor(uiManager: RCTUIManager, eventDispatcher: RCTEventDispatcher) {
    this.uiManager = uiManager;
    this.eventDispatcher = eventDispatcher;
    this.registry = new RNGestureHandlerRegistry();
    this.rootViews = new Set();
  }

  createGestureHandler(
    handlerName: string,
    handlerTag: number,
    config: Object
  ) {
    DEBUG &&
      console.log('createGestureHandler', handlerName, handlerTag, config);
    const NodeClass = HANLDER_MAP[handlerName];
    if (!NodeClass) {
      console.error(`Gesture handler type ${handlerName} is not supported`);
      return;
    }

    const gestureHandler = new NodeClass(handlerTag);
    gestureHandler.configure(config);
    this.registry.registerGestureHandler(gestureHandler);

    gestureHandler.emitter = this;
  }

  attachGestureHandler(handlerTag: number, viewTag: number) {
    DEBUG && console.log('attachGestureHandler', handlerTag, viewTag);
    const view: ?UIView = this.uiManager.viewRegistry.get(viewTag);
    invariant(view, `No such view with tag: ${viewTag}`);

    this.registry.attachHandler(handlerTag, view);

    // TODO: register root view if not already there
  }

  updateGestureHandler(handlerTag: number, config: Object) {
    DEBUG && console.log('updateGestureHandler', handlerTag, config);
    const handler = this.registry.handlerWithTag(handlerTag);
    handler.configure(config);
  }

  dropGestureHandler(handlerTag: number) {
    DEBUG && console.log('dropGestureHandler', handlerTag);
    this.registry.dropHandler(handlerTag);
  }

  handleSetJSResponder(viewTag: number, blockNativeResponder: number) {
    DEBUG && console.log('handleSetJSResponder', viewTag, blockNativeResponder);
    // TODO: Implement
  }

  handleClearJSResponder() {
    DEBUG && console.log('handleClearJSResponder');
    // Ignore
  }

  sendTouchEvent(event: RNGestureHandlerEvent) {
    this.eventDispatcher.sendEvent(event);
  }

  sendStateChangeEvent(event: RNGestureHandlerStateChangeEvent) {
    this.eventDispatcher.sendEvent(event);
  }
}
