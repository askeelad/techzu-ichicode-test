import { View, Text, StyleSheet } from 'react-native';
import { useAppDispatch } from '@store/index';
import { logout } from '@store/index';
import { storage } from '@utils/storage';
import { PrimaryButton } from '@components/ui/PrimaryButton';
import { COLORS, FONTS, SPACING } from '@constants/index';

export default function FeedScreen() {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await storage.clearTokens();
    dispatch(logout()); // triggers the RootLayout guard to redirect to /login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feed Screen</Text>
      <Text style={styles.subtitle}>You are successfully logged in!</Text>
      
      <PrimaryButton 
        title="Logout" 
        onPress={handleLogout} 
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 16,
    marginBottom: SPACING.xxxl,
  },
  button: {
    width: 200,
  },
});
