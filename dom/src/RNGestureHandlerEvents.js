// @flow
import type { RCTEvent } from 'react-native-dom';
import { type RNGestureHandlerState } from './RNGestureHandlerState';

export type Point = { x: number, y: number };

function safeVelocity(velocity: number) {
  return isNaN(velocity) ? 0 : velocity;
}

export class RNGestureHandlerEventExtraData {
  static forPosition(
    position: Point,
    absolutePosition: Point,
    numberOfTouches: number
  ) {
    return new RNGestureHandlerEventExtraData({
      x: position.x,
      y: position.y,
      absoluteX: absolutePosition.x,
      absoulteY: absolutePosition.y,
      numberOfPointers: numberOfTouches,
    });
  }

  static forPan(
    position: Point,
    absolutePosition: Point,
    translation: Point,
    velocity: Point,
    numberOfTouches: number
  ) {
    return new RNGestureHandlerEventExtraData({
      x: position.x,
      y: position.y,
      absoluteX: absolutePosition.x,
      absoulteY: absolutePosition.y,
      translationX: translation.x,
      translationY: translation.y,
      velocityX: velocity.x,
      velocityY: velocity.y,
      numberOfPointers: numberOfTouches,
    });
  }

  static forPinch(
    scale: number,
    focalPoint: Point,
    velocity: number,
    numberOfTouches: number
  ) {
    return new RNGestureHandlerEventExtraData({
      scale: scale,
      focalX: focalPoint.x,
      focalY: focalPoint.y,
      velocity: safeVelocity(velocity),
      numberOfPointers: numberOfTouches,
    });
  }

  static forRotation(
    rotation: number,
    anchorPoint: Point,
    velocity: number,
    numberOfTouches: number
  ) {
    return new RNGestureHandlerEventExtraData({
      rotation: rotation,
      anchorX: anchorPoint.x,
      anchorY: anchorPoint.y,
      velocity: safeVelocity(velocity),
      numberOfPointers: numberOfTouches,
    });
  }

  static forPointerInside(pointerInside: boolean) {
    return new RNGestureHandlerEventExtraData({ pointerInside });
  }

  data: Object;
  constructor(data: Object) {
    this.data = data;
  }
}

let coalescingKey = 1;

export class RNGestureHandlerEvent implements RCTEvent {
  handlerTag: number;
  state: RNGestureHandlerState;
  extraData: RNGestureHandlerEventExtraData;

  viewTag: number;
  coalescingKey: number;

  constructor(
    reactTag: number,
    handlerTag: number,
    state: RNGestureHandlerState,
    extraData: RNGestureHandlerEventExtraData
  ) {
    this.viewTag = reactTag;
    this.handlerTag = handlerTag;
    this.state = state;
    this.extraData = extraData;
    this.coalescingKey = coalescingKey++;
  }

  eventName = 'onGestureHandlerEvent';

  canCoalesce() {
    return false;
  }

  coalesceWithEvent(newEvent: RCTEvent) {
    return newEvent;
  }

  moduleDotMethod() {
    return 'RCTEventEmitter.receiveEvent';
  }

  arguments() {
    const body = {
      ...this.extraData.data,
      target: this.viewTag,
      handlerTag: this.handlerTag,
      state: this.state,
    };
    return [this.viewTag, 'topGestureHandlerEvent', body];
  }
}

export class RNGestureHandlerStateChangeEvent implements RCTEvent {
  handlerTag: number;
  state: RNGestureHandlerState;
  prevState: RNGestureHandlerState;
  extraData: RNGestureHandlerEventExtraData;

  viewTag: number;
  coalescingKey: number;

  constructor(
    reactTag: number,
    handlerTag: number,
    state: RNGestureHandlerState,
    prevState: RNGestureHandlerState,
    extraData: RNGestureHandlerEventExtraData
  ) {
    this.viewTag = reactTag;
    this.handlerTag = handlerTag;
    this.state = state;
    this.prevState = prevState;
    this.extraData = extraData;
    this.coalescingKey = coalescingKey++;
  }

  eventName = 'onGestureHandlerStateChange';

  canCoalesce() {
    return false;
  }

  coalesceWithEvent(newEvent: RCTEvent) {
    return newEvent;
  }

  moduleDotMethod() {
    return 'RCTEventEmitter.receiveEvent';
  }

  arguments() {
    const body = {
      ...this.extraData.data,
      target: this.viewTag,
      handlerTag: this.handlerTag,
      state: this.state,
      oldState: this.prevState,
    };
    return [this.viewTag, 'topGestureHandlerStateChange', body];
  }
}
