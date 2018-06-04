// @flow

export const RNGestureHandlerDirectionRight = 1;
export const RNGestureHandlerDirectionLeft = 2;
export const RNGestureHandlerDirectionUp = 4;
export const RNGestureHandlerDirectionDown = 8;

export type RNGestureHandlerDirection =
  | typeof RNGestureHandlerDirectionRight
  | typeof RNGestureHandlerDirectionLeft
  | typeof RNGestureHandlerDirectionUp
  | typeof RNGestureHandlerDirectionDown;
