import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { trpcClient } from '@/lib/trpc';

const PRODUCTS = [
  {
    id: 'fsv.family.yearly',
    title: 'Yearly',
    price: '$39.99',
    period: 'per year',
    savings: 'Save 33%',
    features: [
      'Unlimited stories',
      'All voice features',
      'Priority support',
      'New features first',
    ],
    popular: true,
  },
  {
    id: 'fsv.family.monthly',
    title: 'Monthly',
    price: '$4.99',
    period: 'per month',
    features: [
      'Unlimited stories',
      'All voice features',
      'Priority support',
    ],
    popular: false,
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { purchaseSubscription, restorePurchases } = useSubscription();
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0].id);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const baseUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL ?? '';
  }, []);

  const handlePurchase = async () => {
    if (Platform.OS === 'web') {
      setIsPurchasing(true);
      try {
        const successUrl = `${baseUrl}/`; // redirect back to home
        const cancelUrl = `${baseUrl}/paywall`;
        const priceMap: Record<string, string> = {
          'fsv.family.yearly': 'price_yearly_placeholder',
          'fsv.family.monthly': 'price_monthly_placeholder',
        };
        const priceId = priceMap[selectedProduct];
        const res = await trpcClient.payments.createCheckoutSession.mutate({
          mode: 'subscription',
          priceId,
          successUrl,
          cancelUrl,
        });
        if (res.url) {
          await Linking.openURL(res.url);
        } else {
          alert('Unable to start checkout.');
        }
      } catch (err) {
        console.log('Stripe checkout error', err);
        alert('Checkout failed.');
      } finally {
        setIsPurchasing(false);
      }
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await purchaseSubscription(selectedProduct);
      if (success) {
        router.back();
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      alert('In-app purchases are not available on web.');
      return;
    }

    setIsRestoring(true);
    try {
      await restorePurchases();
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: '',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Sparkles size={48} color={colors.accent} />
            </View>
            <Text style={styles.title}>Unlock Unlimited Stories</Text>
            <Text style={styles.subtitle}>
              Create as many bedtime stories as you want with your family&apos;s voices
            </Text>
          </View>

          <View style={styles.productsContainer}>
            {PRODUCTS.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  selectedProduct === product.id && styles.productCardSelected,
                ]}
                onPress={() => setSelectedProduct(product.id)}
                activeOpacity={0.8}
              >
                {product.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.productHeader}>
                  <View>
                    <Text style={styles.productTitle}>{product.title}</Text>
                    {product.savings && (
                      <Text style={styles.savingsText}>{product.savings}</Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.productPrice}>{product.price}</Text>
                    <Text style={styles.productPeriod}>{product.period}</Text>
                  </View>
                </View>
                <View style={styles.featuresContainer}>
                  {product.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Check size={16} color={colors.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                {selectedProduct === product.id && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            testID="purchase-button"
            style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={isPurchasing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              {isPurchasing ? (
                <>
                  <ActivityIndicator color={colors.text} />
                  <Text style={styles.purchaseButtonText}>Processing...</Text>
                </>
              ) : (
                <Text style={styles.purchaseButtonText}>Subscribe Now</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring}
          >
            <Text style={styles.restoreButtonText}>
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              • Cancel anytime{'\n'}
              • Subscription auto-renews{'\n'}
              • Manage in App Store settings
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  productsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  productCardSelected: {
    borderColor: colors.accent,
  },
  popularBadge: {
    position: 'absolute' as const,
    top: -12,
    left: 20,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.background,
    letterSpacing: 0.5,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.success,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'right' as const,
  },
  productPeriod: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right' as const,
  },
  featuresContainer: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  purchaseButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  restoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
