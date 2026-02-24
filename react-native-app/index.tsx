import 'react-native-gesture-handler';
import { ExpoRoot } from 'expo-router';
import Head from 'expo-router/head';

// Tell expo-router to use this file as the root
export function App() {
  // @ts-ignore - Expo specific require.context
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

export default App;
