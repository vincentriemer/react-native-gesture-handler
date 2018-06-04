import { RNDomInstance } from 'react-native-dom';

// Path to RN Bundle Entrypoint ================================================
const rnBundlePath = './entry.bundle?platform=dom&dev=true';

// React Native DOM Runtime Options =============================================
import RNGestureHandlerModules from 'react-native-gesture-handler/dom';

const ReactNativeDomOptions = {
  enableHotReload: false,
  nativeModules: [...RNGestureHandlerModules],
};

// App Initialization ============================================================
const app = new RNDomInstance(
  rnBundlePath,
  'Example',
  document.body,
  ReactNativeDomOptions
);

app.start();
