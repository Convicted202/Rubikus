/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import Home from './src/Home';
import { name as appName } from './app.json';

LogBox.ignoreAllLogs();

AppRegistry.registerComponent(appName, () => Home);
