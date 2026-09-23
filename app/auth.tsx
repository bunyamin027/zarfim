/**
 * Auth Ekranı — Email + Apple/Google Sign-In (i18n destekli)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import PrimaryButton from '@/components/PrimaryButton';
import AppIcon from '@/components/AppIcon';
import { useAuthStore } from '@/store/auth';

export default function AuthScreen() {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithApple,
    signInWithGoogle,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }

    if (isSignUp) {
      await signUpWithEmail(email.trim(), password);
    } else {
      await signInWithEmail(email.trim(), password);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <AppIcon name="mail-outline" size={32} color={Colors.gold} />
          </View>
          <Text style={styles.title}>{t('auth.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={clearError}>
                <Text style={styles.errorDismiss}>✕</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.label}>{t('auth.email')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={Colors.paperDark}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
          />

          <Text style={styles.label}>{t('auth.password')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={Colors.paperDark}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            editable={!isLoading}
          />

          <View style={styles.submitContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.stamp} />
            ) : (
              <PrimaryButton
                title={isSignUp ? t('auth.signUp') : t('auth.signIn')}
                onPress={handleSubmit}
                icon={isSignUp ? 'person-add-outline' : 'log-in-outline'}
              />
            )}
          </View>

          <Pressable
            onPress={() => {
              setIsSignUp(!isSignUp);
              clearError();
            }}
            style={styles.toggleContainer}
          >
            <Text style={styles.toggleText}>
              {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}
              <Text style={styles.toggleLink}>
                {isSignUp ? t('auth.signInLink') : t('auth.signUpLink')}
              </Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('auth.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.socialButton,
              styles.appleButton,
              (pressed || isLoading) && { opacity: 0.7 }
            ]}
            onPress={() => {
              signInWithApple();
            }}
          >
            <Text style={styles.appleIcon}></Text>
            <Text style={styles.appleText}>{t('auth.continueWithApple')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.socialButton,
              styles.googleButton,
              (pressed || isLoading) && { opacity: 0.7 }
            ]}
            onPress={() => {
              signInWithGoogle();
            }}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>{t('auth.continueWithGoogle')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(201, 151, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxxl,
    color: Colors.paper,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paperDark,
  },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.paperDark,
    borderStyle: 'dashed',
  },
  cardTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.stamp,
  },
  errorDismiss: {
    fontSize: 16,
    color: Colors.stamp,
    paddingStart: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.ink,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.paperDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.ink,
    textAlign: 'auto',
  },
  submitContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  toggleContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.inkLight,
  },
  toggleLink: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.stamp,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.inkLight,
    opacity: 0.4,
  },
  dividerText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    marginHorizontal: Spacing.lg,
  },
  socialContainer: {
    gap: Spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
  },
  appleButton: {
    backgroundColor: Colors.white,
  },
  appleIcon: {
    fontSize: 20,
    marginEnd: Spacing.sm,
    color: Colors.black,
  },
  appleText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.black,
  },
  googleButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.paperDark,
  },
  googleIcon: {
    fontSize: 18,
    fontFamily: Fonts.bodyBold,
    marginEnd: Spacing.sm,
    color: '#4285F4',
  },
  googleText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.ink,
  },
});
