import { Redirect } from 'expo-router';

/**
 * Root index — immediately redirected.
 * The auth guard in _layout.tsx will take over and push to:
 *   → /(auth)/login  if not logged in
 *   → /(app)/feed    if already logged in
 */
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
