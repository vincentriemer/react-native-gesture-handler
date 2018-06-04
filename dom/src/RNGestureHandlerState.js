// @flow

export const RNGestureHandlerStateUndetermined = 0;
export const RNGestureHandlerStateFailed = 1;
export const RNGestureHandlerStateBegan = 2;
export const RNGestureHandlerStateCancelled = 3;
export const RNGestureHandlerStateActive = 4;
export const RNGestureHandlerStateEnd = 5;

export type RNGestureHandlerState =
  | typeof RNGestureHandlerStateUndetermined
  | typeof RNGestureHandlerStateFailed
  | typeof RNGestureHandlerStateBegan
  | typeof RNGestureHandlerStateCancelled
  | typeof RNGestureHandlerStateActive
  | typeof RNGestureHandlerStateEnd;
