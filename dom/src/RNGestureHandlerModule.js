// @flow

import {
  RCT_EXPORT_MODULE,
  type RCTBridge,
  RCTEventEmitter,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal,
  type RCTUIManager,
  RCTViewManager as _RCTViewManager,
  type UIView,
} from 'react-native-dom';
import {
  RNGestureHandlerStateUndetermined,
  RNGestureHandlerStateBegan,
  RNGestureHandlerStateActive,
  RNGestureHandlerStateCancelled,
  RNGestureHandlerStateFailed,
  RNGestureHandlerStateEnd,
} from './RNGestureHandlerState';
import {
  RNGestureHandlerDirectionRight,
  RNGestureHandlerDirectionLeft,
  RNGestureHandlerDirectionUp,
  RNGestureHandlerDirectionDown,
} from './RNGestureHandlerDirection';
import { RNGestureHandlerManager } from './RNGestureHandlerManager';
import { RNGestureHandlerButton } from './RNGestureHandlerButton';

type GestureHandlerOperation = (manager: RNGestureHandlerManager) => void;

@RCT_EXPORT_MODULE('RNGestureHandlerModule')
class RNGestureHandlerModule extends RCTEventEmitter {
  bridge: RCTBridge;
  manager: RNGestureHandlerManager;
  operations: GestureHandlerOperation[];

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.manager = new RNGestureHandlerManager(
      bridge.uiManager,
      bridge.eventDispatcher
    );
    this.operations = [];
    bridge.uiManager.observerCoordinator.addObserver(this);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  createGestureHandler(
    handlerName: string,
    handlerTag: number,
    config: Object
  ) {
    this.addOperationBlock(manager => {
      manager.createGestureHandler(handlerName, handlerTag, config);
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  attachGestureHandler(handlerTag: number, viewTag: number) {
    this.addOperationBlock(manager => {
      manager.attachGestureHandler(handlerTag, viewTag);
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  updateGestureHandler(handlerTag: number, config: Object) {
    this.addOperationBlock(manager => {
      manager.updateGestureHandler(handlerTag, config);
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  dropGestureHandler(handlerTag: number) {
    this.addOperationBlock(manager => {
      manager.dropGestureHandler(handlerTag);
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  handleSetJSResponder(viewTag: number, blockNativeResponder: number) {
    this.addOperationBlock(manager => {
      manager.handleSetJSResponder(viewTag, blockNativeResponder);
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  handleClearJSResponder() {
    this.addOperationBlock(manager => {
      manager.handleClearJSResponder();
    });
  }

  // -- Batch handling

  addOperationBlock(operation: GestureHandlerOperation) {
    this.operations.push(operation);
  }

  // -- RCTUIManagerObserver

  uiManagerWillFlushBlocks = (uiManager: RCTUIManager) => {
    this.uiManagerWillPerformMounting(uiManager);
  };

  uiManagerWillPerformMounting(uiManager: RCTUIManager) {
    if (this.operations.length === 0) return;

    const operations = this.operations;
    this.operations = [];

    uiManager.addUIBlock(() => {
      for (let operation of operations) {
        operation(this.manager);
      }
    });
  }

  // -- Events

  supportedEvents() {
    return ['onGestureHandlerEvent', 'onGestureHandlerStateChange'];
  }

  // -- Module Constants

  constantsToExport() {
    return {
      State: {
        UNDETERMINED: RNGestureHandlerStateUndetermined,
        BEGAN: RNGestureHandlerStateBegan,
        ACTIVE: RNGestureHandlerStateActive,
        CANCELLED: RNGestureHandlerStateCancelled,
        FAILED: RNGestureHandlerStateFailed,
        END: RNGestureHandlerStateEnd,
      },
      Direction: {
        RIGHT: RNGestureHandlerDirectionRight,
        LEFT: RNGestureHandlerDirectionLeft,
        UP: RNGestureHandlerDirectionUp,
        DOWN: RNGestureHandlerDirectionDown,
      },
    };
  }
}

const RNGestureHandlerButtonManager = (async () => {
  const RCTViewManager = await _RCTViewManager;

  @RCT_EXPORT_MODULE('RNGestureHandlerButton')
  class RNGestureHandlerButtonManager extends RCTViewManager {
    view(): UIView {
      return new RNGestureHandlerButton(this.bridge);
    }
  }

  return RNGestureHandlerButtonManager;
})();

export default [RNGestureHandlerModule, RNGestureHandlerButtonManager];
